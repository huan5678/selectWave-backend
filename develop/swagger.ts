import swaggerAutogen from "swagger-autogen";
import path from "path";
import { ErrorSchema } from "./ErrorSchema";

const doc = {
  info: {
    title: "Select Wave 選集 API 系統 - Swagger",
    description: `部分API需求 \n注意事項：登入成功後請點「Authorize」輸入 Token。\n\n範例程式碼 :

    fetch(\`\${baseUrl}/api/auth/check\`, { method: 'GET', headers: {
        'Authorization': 'Bearer ' + token
    }})
      .then(response => response.json())
      .then(res => {
          // { status: 'true', result: [{...}] }
          console.log(res);
      });
    `,
  },
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      in: "header",
      name: "authorization",
      description: "請加上 API Token 以取得授權 格式: Bearer xxxxx",
    },
  },
  definitions: {
    User: {
      _id: "62e348927278654321000001",
      email: "johndoe@example.com",
      password: "hashed-password",
      name: "John Doe",
      avatar: "https://i.imgur.com/xcLTrkV.png",
      gender: "male",
      followers: [
        {
          user: {
            _id: "62e348927278654321000002",
            name: "Jane Doe",
            avatar: "https://i.imgur.com/xcLTrkV.png",
          },
          createdAt: "2023-12-01T00:00:00.000Z",
        },
      ],
      following: [
        {
          user: {
            _id: "62e348927278654321000003",
            name: "Bob Smith",
            avatar: "https://i.imgur.com/xcLTrkV.png",
          },
          createdAt: "2023-12-01T00:00:00.000Z",
        },
      ],
      createdAt: "2023-12-01T00:00:00.000Z",
      socialMedia: [
        {
          type: "facebook",
          id: "1234567890",
        },
        {
          type: "twitter",
          id: "johndoe",
        },
      ],
      isVerified: true,
      role: "user",
    },
    UserProfile: {
      name: "John Doe",
      avatar: "https://i.imgur.com/xcLTrkV.png",
      gender: "male",
      socialMedia: [
        { type: "facebook", id: "1234567890" },
        { type: "twitter", id: "johndoe" },
      ],
    },
    Member: {
      _id: "62e348927278654321000001",
      name: "John Doe",
      avatar: "https://i.imgur.com/xcLTrkV.png",
      gender: "male",
      follwing: [
        {
          user: {
            _id: "62e348927278654321000003",
            name: "Bob Smith",
            avatar: "https://i.imgur.com/xcLTrkV.png",
          },
          createdAt: "2023-12-01T00:00:00.000Z",
        },
      ],
      followers: [
        {
          user: {
            _id: "62e348927278654321000002",
            name: "Mary Johnson",
            avatar: "https://i.imgur.com/xcLTrkV.png",
          },
          createdAt: "2023-12-01T00:00:00.000Z",
        },
      ],
      socialMedia: [
        {
          type: "facebook",
          id: "1234567890",
        },
        {
          type: "twitter",
          id: "johndoe",
        },
      ],
      id: "62e348927278654321000001",
    },
    Members: [
      {
        id: "62e348927278654321000001",
        name: "John Doe",
        avatar: "https://i.imgur.com/",
      },
    ],
    PollCreate: {
      title: "最喜歡的程式語言",
      description: "選擇您最喜歡的程式語言。",
      imageUrl: "https://i.imgur.com/D3hp8H6.png",
      tags: ["程式語言", "技術"],
      startDate: "2023-01-01T00:00:00.000Z",
      endDate: "2023-01-07T00:00:00.000Z",
      isPrivate: false,
      optionsData: [
        {
          title: "JavaScript",
          imageUrl: "https://imgur.com/TECsq2J.png",
        },
        {
          title: "Python",
          imageUrl: "https://imgur.com/TECsq2J.png",
        },
      ],
    },
    PollUpdate: {
      title: "最喜歡的前端框架",
      description: "選擇您最喜歡的前端開發框架。",
      tags: ["前端", "框架"],
    },
    Poll: {
      id: "投票ID",
      title: "最喜歡的程式語言",
      description: "選擇您最喜歡的程式語言。",
      imageUrl: "https://i.imgur.com/D3hp8H6.png",
      tags: ["程式語言", "技術"],
      createdBy: {
        id: "用戶ID",
        name: "John Doe",
        avatar: "https://i.imgur.com/xcLTrkV.png",
      },
      startDate: "2023-01-01T00:00:00.000Z",
      endDate: "2023-01-07T00:00:00.000Z",
      isPrivate: false,
      totalVoters: 10,
      options: [],
      like: [],
      comments: [],
      status: "active",
    },
    OptionCreate: {
      title: "React",
      imageUrl: "https://imgur.com/TECsq2J.png",
      pollId: "投票ID",
    },
    OptionUpdate: {
      title: "Vue",
      imageUrl: "https://imgur.com/TECsq2J.png",
    },
    Option: [
      {
        id: "選項ID",
        title: "React",
        imageUrl: "https://imgur.com/TECsq2J.png",
        pollId: "投票ID",
        voters: [],
        isWinner: false,
      },
      {
        id: "選項ID",
        title: "Vue.js",
        imageUrl: "https://imgur.com/TECsq2J.png",
        pollId: "投票ID",
        voters: [],
        isWinner: false,
      },
    ],
    CommentCreate: {
      pollId: "投票ID",
      userId: "留言者ID",
      content: "我非常喜歡這個投票！",
    },
    CommentUpdate: {
      content: "我改變了我的想法，這真是一個棒極了的投票！",
      edited: true,
    },
    Comment: [
      {
        id: "評論ID",
        pollId: "投票ID",
        userId: {
          id: "用戶ID",
          name: "Jane Doe",
          avatar: "https://i.imgur.com/newAvatar.png",
        },
        content: "這是一個很好的投票！",
        createdTime: "2023-01-02T00:00:00.000Z",
        role: "user",
        edited: false,
      },
    ],
    // Error Response
    ...ErrorSchema,
  },
};

const outputFile = `${path.resolve()}/develop/swagger_output.json`;
const endpointsFiles = [`${path.resolve()}/src/routes/index.ts`];

swaggerAutogen(outputFile, endpointsFiles, doc);
