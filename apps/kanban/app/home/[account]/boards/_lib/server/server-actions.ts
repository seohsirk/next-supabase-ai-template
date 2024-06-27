'use server';

import {getSupabaseServerActionClient} from "@kit/supabase/server-actions-client";
import {createTeamAccountsApi} from "@kit/team-accounts/api";
import {insertBoard} from "~/lib/kanban/boards/mutations";
import {redirect} from "next/navigation";
import {enhanceAction} from "@kit/next/actions";
import {z} from "zod";

export const createBoardAction = enhanceAction(data => {
    const client = getSupabaseServerActionClient();
    const teamAccountsApi = createTeamAccountsApi(client);

    const account = await teamAccountsApi.getTeamAccount(data.accountSlug);

    const {data: board, error} = await insertBoard(client, {
        name: data.name,
        description: data.description,
        accountId: account.id,
    })
        .select('id')
        .single();

    if (error) {
        throw new Error(error.message);
    }

    redirect(`boards/${board.id}`);
}, {
    schema: z.object({
        name: z.string().min(2),
        description: z.string(),
        accountSlug: z.string().min(1)
    })
})
