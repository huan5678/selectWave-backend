function resetPasswordTemplate({ userName, resetUrl }: { userName: string; resetUrl: string }) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>選集</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp"></script>
  </head>
  <body>
    <img src="https://i.imgur.com/2FdV2yP.png" />

    <p>尊貴的<h1>${userName}</h1> 您好，
      <br />
      我們很高興能協助您重設「選集」帳戶。如果需要您協助進行此動作，請依照下列指示進行。
      <br />
      如果您並未要求重設密碼，請忽略此電子郵件。別擔心，您的帳戶很安全。
      <br />
      按一下下列連結，設定新密碼。
      <br />
      此驗證連結僅具一日效力請盡速改改密碼。
      <br />
      <a href="${resetUrl}">
        ${resetUrl}
      </a>
      <br />
      如果沒有反應，您可以將連結複製到瀏覽器視窗或直接輸入連結網址。
      <br />
      選集團隊誠摯敬上
    </p>
  </body>
</html>
`;
}

export default resetPasswordTemplate;
