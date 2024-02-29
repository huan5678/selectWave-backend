// services/TagService.js

import { Tag } from "@/models";
import { ITag } from "@/types";

class TagService {
  static async createTag(name: string): Promise<ITag> {
    return Tag.create({ name });
  }

  static async findTags(query: object): Promise<ITag[]> {
    return Tag.find(query).sort({ createdAt: -1 }).exec();
  }

  static async findTagById(id: string): Promise<ITag | null> {
    return Tag.findById(id).exec();
  }

  static async updateTag(id: string, name: string): Promise<ITag | null> {
    return Tag.findByIdAndUpdate(id, { name }, { new: true }).exec();
  }

  static async deleteTag(id: string): Promise<ITag | null> {
    return Tag.findByIdAndDelete(id).exec();
  }

  static async createMultipleTags(tagNames: string[]): Promise<ITag[]> {
    const tagDocuments = tagNames.map(name => ({ name }));
    return Tag.insertMany(tagDocuments);
  }

  static async createTagsIfNotExist(tagNames: string[]): Promise<ITag[]> {
    const existingTags = await Tag.find({ name: { $in: tagNames } });
    const existingTagNames = existingTags.map(tag => tag.name);

    const newTagNames = tagNames.filter(name => !existingTagNames.includes(name));

    if (newTagNames.length > 0) {
      return this.createMultipleTags(newTagNames);
    }

    return Tag.find({ name: { $in: tagNames } });
  }
}

export default TagService;
