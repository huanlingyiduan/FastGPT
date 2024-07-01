import { connectToDatabase } from '@/service/mongo';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { t } from 'i18next';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const { username, password } = req.body as { username: string; password: string };

    if (!username || !password) {
      throw new Error('用户名和密码不能为空！');
    }

    const user = await MongoUser.findOne({ username });

    if (!user) {
      throw new Error('用户不存在！');
    }

    //更新密码
    await MongoUser.updateOne({ username }, { $set: { password } });

    jsonRes(res, { message: username + '用户密码已更新' });
    console.log(username + '用户密码已更新');
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err,
      message: t('密码更新失败，请重试！')
    });
  }
}
