import { NextResponse } from 'next/server';

import { createTeamAccountsApi } from '@kit/team-accounts/api';
import {getSupabaseServerClient} from "@kit/supabase/server-client";
import {Database} from "~/lib/database.types";

export async function GET(
  _: Request,
  params: {
    account: string;
  },
) {
  const client = getSupabaseServerClient<Database>();
  const teamAccountApi = createTeamAccountsApi(client);

  const members = await teamAccountApi.getMembers(params.account);

  return NextResponse.json(members);
}
