import { Tag } from "@/models";
import { ITag } from "@/types";
import { appError } from "@/utils";
import { NextFunction } from "express";

class TagService {
  static createTag = async (name: string, next:NextFunction): Promise<ITag> =>
  {
    const tag = await Tag.findOne({ name }).exec();
    if (tag) {
      throw appError({ code: 400, message: "標籤已存在", next });
    }
    return Tag.create({ name });
  }

  static findTags = async (query: object): Promise<ITag[]> => {
    return Tag.find(query).sort({ createdAt: -1 }).exec();
  }

  static findTagById =  async (id: string): Promise<ITag | null> => {
    return Tag.findById(id).exec();
  }

  static updateTag = async (id: string, name: string): Promise<ITag | null> => {
    return Tag.findByIdAndUpdate(id, { name }, { new: true }).exec();
  }

  static deleteTag = async (id: string): Promise<ITag | null> => {
    return Tag.findByIdAndDelete(id).exec();
  }

  static createMultipleTags = async (tagNames: string[]): Promise<ITag[]> => {
    const tags = await Tag.find({ name: { $in: tagNames } });
    const existingTagNames = tags.map(tag => tag.name);
    const newTagNames = tagNames.filter(name => !existingTagNames.includes(name));
    const newTags = await Tag.create(newTagNames.map(name => ({ name })));
    return tags.concat(newTags);
  }
}

export default TagService;
