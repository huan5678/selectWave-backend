import { Model, ModelSelect, ModelType } from '@/types';
import { appError } from '@/utils';
import { model as models } from 'mongoose';


export async function modelFindByID(model: ModelType, id: string)
{
  let targetName = '';
  targetName = model === 'User' ? '使用者' : model === 'Poll' ? '提案' : model === 'Comment' ? '評論' : model === 'Tag' ? '標籤' : '選項';
  function checkExists(target: Model)
  {
    if (!target) {
      throw appError({ code: 404, message: `找不到${targetName}資訊請確認 ID 是否正確` });
    }
  }
  const result = await models(model).findById(id).exec() as ModelSelect<ModelType>;
  checkExists(result);
  return result;
}

export async function modelExists(
  model: ModelType,
  modelId: string,
  id: string,
  target: string,
  message: string,
  isExists: boolean)
{
  let targetName = '';
  function checkExists(target: Model)
  {
    if (isExists && !target) {
      throw appError({ code: 404, message: `${targetName}${message}` });
    } else if (!isExists && target) {
      throw appError({ code: 400, message: `${targetName}${message}` });
    }
  }
  targetName = model === 'User' ? '使用者' : model === 'Poll' ? '提案' : model === 'Comment' ? '評論' : model === 'Tag' ? '標籤' : '選項';
  const result = await models(model).findOne({ _id: modelId, [ target ]: id }).exec() as ModelSelect<ModelType>;
  checkExists(result);
  return result;
}