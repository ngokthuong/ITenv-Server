import mongoose from 'mongoose';
import { TypeVoteEnum } from '../enums/typeVote.enum';

export const updateVoteStatus = (
  entity: any,
  userObjectId: mongoose.Types.ObjectId,
  typeVote: TypeVoteEnum,
) => {
  if (typeVote === TypeVoteEnum.upvote) {
    entity.downVote = entity.downVote.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(userObjectId),
    );

    if (entity.vote.includes(userObjectId)) {
      entity.vote = entity.vote.filter((id: mongoose.Types.ObjectId) => !id.equals(userObjectId));
    } else {
      entity.vote.push(userObjectId);
    }
  } else if (typeVote === TypeVoteEnum.downvote) {
    entity.vote = entity.vote.filter((id: mongoose.Types.ObjectId) => !id.equals(userObjectId));

    if (entity.downVote.includes(userObjectId)) {
      entity.downVote = entity.downVote.filter(
        (id: mongoose.Types.ObjectId) => !id.equals(userObjectId),
      );
    } else {
      entity.downVote.push(userObjectId);
    }
  }
  return entity;
};
