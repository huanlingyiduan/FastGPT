import { connectToDatabase } from '@/service/mongo';
import { hashStr } from '@fastgpt/global/common/string/tools';
import { PRICE_SCALE } from '@fastgpt/global/support/wallet/constants';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { createDefaultTeam } from '@fastgpt/service/support/user/team/controller';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const { username, password } = req.body as { username: string; password: string };
    const existingUser = await MongoUser.findOne({ username });

    if (existingUser) {
      throw new Error('用户已存在');
    }
    
    // let user;
    await mongoSessionRun(async (session) => {
      const [{ _id }] = await MongoUser.create(
        [
          {
            username,
            password
          }
        ],
        { session }
      );
      // user = await MongoUser.findOne({ _id });

      // 创建默认团队或进行其他初始设置
      await createDefaultTeam({ userId: _id, balance: 9999 * PRICE_SCALE, session });
    });

    // jsonRes(res, {
    //     data: {
    //         userId: user
    //     }
    // });
    jsonRes(res);
  } catch (err) {
    console.error('注册失败：', err);
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
