import { ValidateProps } from '@/api-lib/constants';
import { findCategories, insertCategory } from '@/api-lib/db';
import { auths, database, validateBody } from '@/api-lib/middlewares';
import { ncOpts } from '@/api-lib/nc';
import nc from 'next-connect';

const handler = nc(ncOpts);

handler.use(database);

handler.get(async (req, res) => {
  const categories = await findCategories(
    req.db,
    req.query.before ? new Date(req.query.before) : undefined,
    req.query.by,
    req.query.limit ? parseInt(req.query.limit, 10) : undefined
  );

  res.json({ categories });
});

handler.category(
  ...auths,
  validateBody({
    type: 'object',
    properties: {
      content: ValidateProps.category.content,
    },
    required: ['content'],
    additionalProperties: false,
  }),
  async (req, res) => {
    if (!req.user) {
      return res.status(401).end();
    }

    const category = await insertCategory(req.db, {
      content: req.body.content,
      creatorId: req.user._id,
    });

    return res.json({ category });
  }
);

export default handler;
