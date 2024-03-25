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
  const sessionResponse = await sessionMiddleware(request, csrfResponse);

  // handle patterns for specific routes
  const handlePattern = matchUrlPattern(request.url);

  // if a pattern handler exists, call it
  if (handlePattern) {
    const patternHandlerResponse = await handlePattern(
      request,
      sessionResponse,
    );

    // if a pattern handler returns a response, return it
    if (patternHandlerResponse) {
      return patternHandlerResponse;
    }
  }

  // if no pattern handler returned a response, return the session response
  return sessionResponse;
}

async function sessionMiddleware(req: NextRequest, res: NextResponse) {
  const supabase = createMiddlewareClient(req, res);

  await supabase.auth.getSession();

  return res;
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
        const { data } = await supabase.auth.getSession();

        // If user is logged in, redirect to home page.
        if (data.session) {
          return NextResponse.redirect(
            new URL(pathsConfig.app.home, req.nextUrl.origin).href,
          );
        }
      },
    },
    {
      pattern: new URLPattern({ pathname: '/home/*' }),
      handler: async (req: NextRequest, res: NextResponse) => {
        const supabase = createMiddlewareClient(req, res);
        const { data, error } = await supabase.auth.getSession();
        const origin = req.nextUrl.origin;

        // If user is not logged in, redirect to sign in page.
        if (!data.session || error) {
          return NextResponse.redirect(
            new URL(pathsConfig.auth.signIn, origin).href,
          );
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
