import { ObjectId } from 'mongodb';
import { dbProjectionUsers } from './user';

export async function findCategoryById(db, id) {
  const categories = await db
    .collection('categories')
    .aggregate([
      { $match: { _id: new ObjectId(id) } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'users',
          localField: 'creatorId',
          foreignField: '_id',
          as: 'creator',
        },
      },
      { $unwind: '$creator' },
      { $project: dbProjectionUsers('creator.') },
    ])
    .toArray();
  if (!categories[0]) return null;
  return categories[0];
}

export async function findCategories(db, before, by, limit = 10) {
  return db
    .collection('categories')
    .aggregate([
      {
        $match: {
          ...(by && { creatorId: new ObjectId(by) }),
          ...(before && { createdAt: { $lt: before } }),
        },
      },
      { $sort: { _id: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'creatorId',
          foreignField: '_id',
          as: 'creator',
        },
      },
      { $unwind: '$creator' },
      { $project: dbProjectionUsers('creator.') },
    ])
    .toArray();
}

export async function insertCategory(db, { content, creatorId }) {
  const category = {
    content,
    creatorId,
    createdAt: new Date(),
  };
  const { insertedId } = await db.collection('categories').insertOne(category);
  category._id = insertedId;
  return category;
}
