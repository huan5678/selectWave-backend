export const ErrorSchema = {
  // 通用錯誤
  ErrorFormat: {
    status: false,
    message: "請確認輸入的欄位格式是否正確",
  },
  ErrorNotFound: {
    status: false,
    message: "請確認 id 是否正確",
  },
  ErrorUnauthorized: {
    status: false,
    message: "沒有權限進行此操作",
  },
  
  // Token 相關錯誤
  ErrorTokenExpired: {
    status: false,
    message: "Token 已經過期或無效",
  },
  ErrorJsonWebToken: {
    status: false,
    message: "驗證失敗,請重新登入!",
  },
  ErrorTokenNotFound: {
    status: false,
    message: "缺少 Token",
  },
  
  // 使用者相關錯誤
  ErrorEmailNotFound: {
    status: false,
    message: "已無此使用者請重新註冊 | 請確認 Email 是否正確 | 此 Email 未註冊",
  },
  ErrorPasswordNotMatch: {
    status: false,
    message: "密碼不一致 | 密碼錯誤",
  },
  ErrorEmailFormat: {
    status: false,
    message: "Email 格式有誤,請確認輸入是否正確",
  },
  ErrorPasswordFormat: {
    status: false,
    message:
      "密碼強度不足,請確認是否具至少有 1 個數字,1 個大寫英文,1 個小寫英文,1 個特殊符號,且長度至少為 8 個字元",
  },
  ErrorEmailExist: {
    status: false, 
    message: "此 Email 已註冊",
  },
  ErrorMemberNotFound: {
    status: false,
    message: "無此使用者請確認使用者 id 是否正確",
  },
  
  // 驗證相關錯誤
  ErrorVerificationUrlExpired: {
    status: false,
    message: "無效的重設連結或已過期",
  },
  
  // 檔案相關錯誤
  ErrorImageFormat: {
    status: false,
    message:
      "檔案格式錯誤,僅限上傳 jpg、jpeg 與 png 格式。圖片大小不可超過 2MB",
  },
  ErrorImageNotFound: {
    status: false,
    message: "請上傳檔案",
  },
  
  // 投票相關錯誤  
  ErrorPollNotFound: {
    status: false,
    message: "無此投票請確認提案 id 是否正確",
  },
  ErrorPollValidation: {
    status: false,
    message: "請確實填寫投票資訊", 
  },
  
  // 選項相關錯誤
  ErrorOptionNotFound: {
    status: false,
    message: "無此選項請確認選項 id 是否正確",
  },
  ErrorOptionExist: {
    status: false,
    message: "此選項已存在",
  },
  ErrorOptionFormat: {
    status: false,
    message: "請確實填寫選項資訊",
  },
  
  // 投票相關錯誤
  ErrorVoteExist: {
    status: false,
    message: "您已經對此選項投過票",
  },
  ErrorNotVote: {
    status: false,
    message: "您尚未對此選項投票",
  },
  
  // 留言相關錯誤  
  ErrorCommentNotFound: {
    status: false,
    message: "無此留言請確認留言 id 是否正確",
  },
  ErrorCommentFormat: {
    status: false,
    message: "請確實填寫留言資訊",
  },
  
  // 聯絡相關錯誤
  ErrorContactFormat: {
    status: false,
    message: "請確實填寫聯絡資訊",
  },
};