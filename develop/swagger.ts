import swaggerAutogen from "swagger-autogen";
import path from "path";

const doc = {
  info: {
    title: "Select Wave 選集 API 系統 - Swagger",
    description: `部分API需求 \n注意事項：登入成功後請點「Authorize」輸入 Token。\n\n範例程式碼 :

    fetch('/api/member/', { method: 'GET' })
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
      description: "請加上 API Token",
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
    Poll: {
      _id: "62e348927278654321000004",
      title: "最喜歡的水果？",
      description: "請選擇您最喜歡的水果",
      imageUrl: "https://i.imgur.com/xcLTrkV.png",
      tags: [ "水果", "投票" ],
      createdBy: {
        _id: "62e348927278654321000001",
        name: "John Doe",
        avatar: "https://i.imgur.com/xcLTrkV.png",
      },
      createdTime: "2023-12-01T00:00:00.000Z",
      startDate: "2023-12-01T00:00:00.000Z",
      endDate: "2023-12-08T00:00:00.000Z",
      isPrivate: false,
      totalVoters: 10,
      like: [],
      comments: [
        {
          _id: "62e348927278654321000005",
          pollId: "62e348927278654321000004",
          userId: "62e348927278654321000001",
          content: "我喜歡芒果！",
          createdTime: "2023-12-01T00:00:00.000Z",
          role: "user",
          edited: false,
          updateTime: "2023-12-01T00:00:00.000Z",
        },
      ],
      options: [
        {
          _id: "62e348927278654321000006",
          optionTitle: "蘋果",
          optionImageUrl: "https://i.imgur.com/xcLTrkV.png",
          pollId: "62e348927278654321000004",
        },
        {
          _id: "62e348927278654321000007",
          optionTitle: "香蕉",
          optionImageUrl: "https://i.imgur.com/xcLTrkV.png",
          pollId: "62e348927278654321000004",
        },
        {
          _id: "62e348927278654321000008",
          optionTitle: "芒果",
          optionImageUrl: "https://i.imgur.com/xcLTrkV.png",
          pollId: "62e348927278654321000004",
        },
      ],
    },
      Option: {
        _id: "637b24267525423242675259",
        optionTitle: "Red",
        optionImageUrl: "https://i.imgur.com/xcLTrkV.png",
        pollId: "637b24267525423242675257",
        voters: [
          {
            userId: "637b24267525423242675255",
            createdTime: "2023-11-16T07:52:54.232Z",
            updatedTime: "2023-11-16T07:52:54.232Z",
          },
        ],
      },
    Comment: {
      _id: "637b24267525423242675258",
      pollId: "637b24267525423242675257",
      userId: "637b24267525423242675255",
      content: "This is a great poll!",
      createdTime: "2023-11-16T07:52:54.232Z",
      role: "user",
      edited: false,
      updateTime: "2023-11-16T07:52:54.232Z",
    },
  },
};

const outputFile = `${path.resolve()}/develop/swagger_output.json`;
const endpointsFiles = [`${path.resolve()}/src/routes/index.ts`];

swaggerAutogen(outputFile, endpointsFiles, doc);
