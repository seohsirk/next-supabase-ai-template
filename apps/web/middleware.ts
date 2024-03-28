import type { NextRequest } from 'next/server';
import { NextResponse, URLPattern } from 'next/server';

import csrf from 'edge-csrf';

import { checkRequiresMultiFactorAuthentication } from '@kit/supabase/check-requires-mfa';
import { createMiddlewareClient } from '@kit/supabase/middleware-client';

import appConfig from '~/config/app.config';
import pathsConfig from '~/config/paths.config';

const CSRF_SECRET_COOKIE = 'csrfSecret';
const NEXT_ACTION_HEADER = 'next-action';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|locales|assets|api/*).*)',
  ],
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // apply CSRF and session middleware
  const csrfResponse = await withCsrfMiddleware(request, response);

  // handle patterns for specific routes
  const handlePattern = matchUrlPattern(request.url);

  // if a pattern handler exists, call it
  if (handlePattern) {
    const patternHandlerResponse = await handlePattern(request, csrfResponse);

    // if a pattern handler returns a response, return it
    if (patternHandlerResponse) {
      return patternHandlerResponse;
    }
  }

  // if no pattern handler returned a response, return the session response
  return csrfResponse;
}

async function withCsrfMiddleware(
  request: NextRequest,
  response = new NextResponse(),
) {
  // set up CSRF protection
  const csrfMiddleware = csrf({
    cookie: {
      secure: appConfig.production,
      name: CSRF_SECRET_COOKIE,
    },
    // ignore CSRF errors for server actions since protection is built-in
    ignoreMethods: isServerAction(request)
      ? ['POST']
      : // always ignore GET, HEAD, and OPTIONS requests
        ['GET', 'HEAD', 'OPTIONS'],
  });

  const csrfError = await csrfMiddleware(request, response);

  // if there is a CSRF error, return a 403 response
  if (csrfError) {
    return NextResponse.json('Invalid CSRF token', {
      status: 401,
    });
  }

  // otherwise, return the response
  return response;
}

function isServerAction(request: NextRequest) {
  const headers = new Headers(request.headers);

  return headers.has(NEXT_ACTION_HEADER);
}

async function adminMiddleware(request: NextRequest, response: NextResponse) {
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');

  if (!isAdminPath) {
    return response;
  }

  const supabase = createMiddlewareClient(request, response);
  const { data, error } = await supabase.auth.getUser();
  const host = request.nextUrl.host;

  // If user is not logged in, redirect to sign in page.
  // This should never happen, but just in case.
  if (!data.user || error) {
    return NextResponse.redirect(`${host}/auth/sign-in`);
  }

  const role = data.user?.app_metadata.role;

  // If user is not an admin, redirect to 404 page.
  if (!role || role !== 'super-admin') {
    return NextResponse.redirect(`${host}/404`);
  }

  // in all other cases, return the response
  return response;
}

function getPatterns() {
  return [
    {
      pattern: new URLPattern({ pathname: '/admin*' }),
      handler: adminMiddleware,
    },
    {
      pattern: new URLPattern({ pathname: '/auth*' }),
      handler: async (req: NextRequest, res: NextResponse) => {
        const supabase = createMiddlewareClient(req, res);
        const { data: user, error } = await supabase.auth.getUser();

        // the user is logged out, so we don't need to do anything
        if (error) {
          await supabase.auth.signOut();

          return;
        }

        // check if we need to verify MFA (user is authenticated but needs to verify MFA)
        const isVerifyMfa = req.nextUrl.pathname === pathsConfig.auth.verifyMfa;

        // If user is logged in and does not need to verify MFA,
        // redirect to home page.
        if (user && !isVerifyMfa) {
          return NextResponse.redirect(
            new URL(pathsConfig.app.home, req.nextUrl.origin).href,
          );
        }
      },
    },
    {
      pattern: new URLPattern({ pathname: '/home*' }),
      handler: async (req: NextRequest, res: NextResponse) => {
        const supabase = createMiddlewareClient(req, res);
        const { data: user, error } = await supabase.auth.getUser();
        const origin = req.nextUrl.origin;
        const next = req.nextUrl.pathname;

        console.log('home:user', user);
        console.log('home:error', error);

        // If user is not logged in, redirect to sign in page.
        if (!user || error) {
          const signIn = pathsConfig.auth.signIn;
          const redirectPath = `${signIn}?next=${next}`;

          return NextResponse.redirect(new URL(redirectPath, origin).href);
        }

        const requiresMultiFactorAuthentication =
          await checkRequiresMultiFactorAuthentication(supabase);

        // If user requires multi-factor authentication, redirect to MFA page.
        if (requiresMultiFactorAuthentication) {
          return NextResponse.redirect(
            new URL(pathsConfig.auth.verifyMfa, origin).href,
          );
        }
      },
    },
  ];
}

function matchUrlPattern(url: string) {
  const patterns = getPatterns();
  const input = url.split('?')[0];

  for (const pattern of patterns) {
    const patternResult = pattern.pattern.exec(input);

    if (patternResult !== null && 'pathname' in patternResult) {
      return pattern.handler;
    }
  }
}
