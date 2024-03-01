import { Tag } from "@/models";
import { ITag } from "@/types";

class TagService {
  static createTag = async (name: string): Promise<ITag> => {
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
    const tagDocuments = tagNames.map(name => ({ name }));
    return Tag.insertMany(tagDocuments);
  }

  static createTagsIfNotExist = async (tagNames: string[]): Promise<ITag[]> => {
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
