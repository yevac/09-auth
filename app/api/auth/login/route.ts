import { NextRequest, NextResponse } from 'next/server';
import { api } from '../../api';
import { cookies } from 'next/headers';
import { isAxiosError } from 'axios';
import { logErrorResponse } from '../../_utils/utils';
import { setAuthCookiesFromHeader, setAuthCookiesFromPayload } from '../../_utils/authCookies';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiRes = await api.post('auth/login', body);

    const cookieStore = await cookies();
    const fromHeader = setAuthCookiesFromHeader(cookieStore, apiRes.headers['set-cookie']);
    const fromPayload = setAuthCookiesFromPayload(cookieStore, apiRes.data);
    const hasAccessToken = Boolean(cookieStore.get('accessToken')?.value);

    if (!fromHeader && !fromPayload && !hasAccessToken) {
      return NextResponse.json(
        { error: 'Authentication succeeded but no tokens were provided by upstream API' },
        { status: 502 }
      );
    }

    return NextResponse.json(apiRes.data, { status: apiRes.status });
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status: error.response?.status ?? 500 }
      );
    }
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
