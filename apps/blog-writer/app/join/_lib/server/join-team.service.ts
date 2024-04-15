import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export class JoinTeamService {
  async isCurrentUserAlreadyInAccount(accountId: string) {
    const client = getSupabaseServerComponentClient();

    const { data } = await client
      .from('accounts')
      .select('id')
      .eq('id', accountId)
      .maybeSingle();

    return !!data?.id;
  }

  async getInviteDataFromInviteToken(token: string) {
    // we use an admin client to be able to read the pending membership
    // without having to be logged in
    const adminClient = getSupabaseServerComponentClient({ admin: true });

    const { data: invitation, error } = await adminClient
      .from('invitations')
      .select<
        string,
        {
          id: string;
          account: {
            id: string;
            name: string;
            slug: string;
            picture_url: string;
          };
        }
      >(
        'id, expires_at, account: account_id !inner (id, name, slug, picture_url)',
      )
      .eq('invite_token', token)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (!invitation ?? error) {
      return null;
    }

    return invitation;
  }
}
