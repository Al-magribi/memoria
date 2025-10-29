export const User = {
  firstName: "Alma",
  lastName: "Dev",
  fullName: "Alma Dev",
  username: "almadev",
  email: "alma.dev@memoria.com",
  avatar:
    "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  coverPhoto:
    "https://images.pexels.com/photos/879109/pexels-photo-879109.jpeg",
  friendCount: 480,
  bio: "Just a developer building a cool Facebook clone called Memoria. 🚀",
  details: {
    worksAt: "Software Engineer at Memoria",
    livesIn: "Jakarta, Indonesia",
    from: "Bandung, Indonesia",
    joined: "October 2024",
  },
  photos: [
    "https://images.pexels.com/photos/1658967/pexels-photo-1658967.jpeg",
    "https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg",
    "https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg",
    "https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg",
    "https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg",
    "https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg",
  ],
  friends: [
    {
      id: 1,
      name: "John Smith",
      avatar:
        "https://images.pexels.com/photos/764529/pexels-photo-764529.jpeg",
    },
    {
      id: 2,
      name: "Emily Johnson",
      avatar:
        "https://images.pexels.com/photos/2071881/pexels-photo-2071881.jpeg",
    },
    {
      id: 3,
      name: "Michael Brown",
      avatar:
        "https://images.pexels.com/photos/2085247/pexels-photo-2085247.jpeg",
    },
    {
      id: 4,
      name: "Jessica Davis",
      avatar:
        "https://images.pexels.com/photos/818261/pexels-photo-818261.jpeg",
    },
    {
      id: 5,
      name: "David Wilson",
      avatar:
        "https://images.pexels.com/photos/2092709/pexels-photo-2092709.jpeg",
    },
    {
      id: 6,
      name: "Sarah Miller",
      avatar:
        "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg",
    },
  ],
  privacy: {
    showProfile: "public",
    whoCanSeeFriendsList: "friends",
    whoCanSendFriendRequest: "everyone",
    whoCanSeePhone: "friends",
    whoCanSeeDOB: "friends",
    showEmail: false,
  },
};

export const PostLists = [
  {
    username: "almadev", // Cocokkan dengan User.name
    avatar: User.avatar, // Gunakan avatar User
    timestamp: "5 minutes ago",
    content:
      "Just setting up my new Memoria profile! Excited to share my journey here.",
    images: [
      {
        url: "https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg",
      },
    ],
    videos: [],
    likes: 15,
    comments: 2,
  },
  {
    username: "almadev", // Cocokkan dengan User.name
    avatar: User.avatar, // Gunakan avatar User
    timestamp: "5 minutes ago",
    content:
      "Just setting up my new Memoria profile! Excited to share my journey here.",
    images: [],
    videos: [{ url: "/video_2.mp4" }, { url: "/video_4.mp4" }],
    likes: 15,
    comments: 2,
  },
  {
    username: "Mark Zuckerberg",
    avatar: "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
    timestamp: "2 hours ago",
    content:
      "Building the metaverse is an exciting journey! We're making progress every day.",
    images: [
      {
        url: "https://images.pexels.com/photos/1658967/pexels-photo-1658967.jpeg",
      },
      {
        url: "https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg",
      },
      {
        url: "https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg",
      },
    ],
    videos: [{ url: "/video_1.mp4" }, { url: "/video_2.mp4" }],
    likes: 1250,
    comments: 320,
    shares: 150,
    commentsData: [
      {
        id: "c1",
        user: "Sheryl Sandberg",
        avatar: "https://xsgames.co/randomusers/avatar.php?g=pixel&key=1",
        text: "Incredible progress! The future is exciting.",
        likes: 15,
        timestamp: "1h",
        replies: [
          {
            id: "r1",
            user: "Mark Zuckerberg",
            avatar:
              "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
            text: "Thanks, Sheryl!",
            likes: 8,
            timestamp: "30m",
            replies: [], // Balasan bisa dibalas lagi, tapi kita batasi di sini
          },
        ],
      },
      {
        id: "c2",
        user: "Adam Mosseri",
        avatar: "https://xsgames.co/randomusers/avatar.php?g=pixel&key=2",
        text: "Can't wait to see what's next.",
        likes: 5,
        timestamp: "45m",
        replies: [],
      },
    ],
  },
  {
    username: "Jane Doe",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
    timestamp: "5 hours ago",
    content:
      "Just tried a new recipe for banana bread. It was delicious! 🍞 #baking #foodie",
    images: [
      {
        url: "https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg",
      },
      {
        url: "https://images.pexels.com/photos/358457/pexels-photo-358457.jpeg",
      },
    ],
    videos: [],
    likes: 88,
    comments: 25,
    shares: 12,
  },
];

export const ReelsList = [
  {
    id: "reel1",
    username: "Videographer Keren",
    avatar: "https://i.pravatar.cc/150?img=11",
    video: "https://www.pexels.com/download/video/3129671/",
    caption: "Menikmati sore di taman hiburan! 🎡",
    likes: 1204,
    comments: 201,
    commentsData: [
      {
        id: "c1",
        user: "Sheryl Sandberg",
        avatar: "https://xsgames.co/randomusers/avatar.php?g=pixel&key=1",
        text: "Incredible progress! The future is exciting.",
        likes: 15,
        timestamp: "1h",
        replies: [
          {
            id: "r1",
            user: "Mark Zuckerberg",
            avatar:
              "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
            text: "Thanks, Sheryl!",
            likes: 8,
            timestamp: "30m",
            replies: [], // Balasan bisa dibalas lagi, tapi kita batasi di sini
          },
        ],
      },
      {
        id: "c2",
        user: "Adam Mosseri",
        avatar: "https://xsgames.co/randomusers/avatar.php?g=pixel&key=2",
        text: "Can't wait to see what's next.",
        likes: 5,
        timestamp: "45m",
        replies: [],
      },
    ],
  },
  {
    id: "reel2",
    username: "Travel Blogger",
    avatar: "https://i.pravatar.cc/150?img=12",
    video: "https://www.pexels.com/download/video/3163534/",
    caption: "Tidak ada yang seperti berjalan-jalan di padang bunga.",
    likes: 2300,
    comments: 450,
    commentsData: [
      {
        id: "c1",
        user: "Sheryl Sandberg",
        avatar: "https://xsgames.co/randomusers/avatar.php?g=pixel&key=1",
        text: "Incredible progress! The future is exciting.",
        likes: 15,
        timestamp: "1h",
        replies: [
          {
            id: "r1",
            user: "Mark Zuckerberg",
            avatar:
              "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
            text: "Thanks, Sheryl!",
            likes: 8,
            timestamp: "30m",
            replies: [], // Balasan bisa dibalas lagi, tapi kita batasi di sini
          },
        ],
      },
      {
        id: "c2",
        user: "Adam Mosseri",
        avatar: "https://xsgames.co/randomusers/avatar.php?g=pixel&key=2",
        text: "Can't wait to see what's next.",
        likes: 5,
        timestamp: "45m",
        replies: [],
      },
    ],
  },
  {
    id: "reel3",
    username: "Fashionista",
    avatar: "https://i.pravatar.cc/150?img=13",
    video: "https://www.pexels.com/download/video/3129576/",
    caption: "Pose di atas perahu 💃 #OOTD #Fashion",
    likes: 980,
    comments: 150,
    commentsData: [
      {
        id: "c1",
        user: "Sheryl Sandberg",
        avatar: "https://xsgames.co/randomusers/avatar.php?g=pixel&key=1",
        text: "Incredible progress! The future is exciting.",
        likes: 15,
        timestamp: "1h",
        replies: [
          {
            id: "r1",
            user: "Mark Zuckerberg",
            avatar:
              "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
            text: "Thanks, Sheryl!",
            likes: 8,
            timestamp: "30m",
            replies: [], // Balasan bisa dibalas lagi, tapi kita batasi di sini
          },
        ],
      },
      {
        id: "c2",
        user: "Adam Mosseri",
        avatar: "https://xsgames.co/randomusers/avatar.php?g=pixel&key=2",
        text: "Can't wait to see what's next.",
        likes: 5,
        timestamp: "45m",
        replies: [],
      },
    ],
  },
];

export const Contacts = [
  {
    id: 1,
    name: "John Smith",
    online: true,
    avatar: "https://images.pexels.com/photos/764529/pexels-photo-764529.jpeg",
  },
  {
    id: 2,
    name: "Emily Johnson",
    online: true,
    avatar:
      "https://images.pexels.com/photos/2071881/pexels-photo-2071881.jpeg",
  },
  {
    id: 3,
    name: "Michael Brown",
    online: false,
    avatar:
      "https://images.pexels.com/photos/2085247/pexels-photo-2085247.jpeg",
  },
  {
    id: 4,
    name: "Jessica Davis",
    online: true,
    avatar: "https://images.pexels.com/photos/818261/pexels-photo-818261.jpeg",
  },
  {
    id: 5,
    name: "David Wilson",
    online: false,
    avatar:
      "https://images.pexels.com/photos/2092709/pexels-photo-2092709.jpeg",
  },
  {
    id: 6,
    name: "Sarah Miller",
    online: true,
    avatar:
      "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg",
  },
];

// Data percakapan, kuncinya adalah 'id' dari kontak di atas
export const Conversations = {
  1: [
    {
      id: "msg1",
      text: "Hey John, how are you?",
      senderId: "me",
      timestamp: "10:30 AM",
    },
    {
      id: "msg2",
      text: "I'm good, thanks! How about you?",
      senderId: 1,
      timestamp: "10:31 AM",
    },
  ],
  2: [
    {
      id: "msg3",
      text: "Hi Emily, are we still on for lunch tomorrow?",
      senderId: "me",
      timestamp: "09:15 AM",
    },
  ],
  3: [], // Tidak ada percakapan dengan Michael
  4: [], // Tidak ada percakapan dengan Jessica
};

export const AllUsers = [
  // Pengguna yang sudah berteman (dari User.friends)
  {
    id: 1,
    name: "John Smith",
    username: "johnsmith",
    avatar: "https://images.pexels.com/photos/764529/pexels-photo-764529.jpeg",
    isFriend: true, // Menandakan sudah berteman
  },
  {
    id: 2,
    name: "Emily Johnson",
    username: "emilyj",
    avatar:
      "https://images.pexels.com/photos/2071881/pexels-photo-2071881.jpeg",
    isFriend: true,
  },
  {
    id: 3,
    name: "Michael Brown",
    username: "mikeb",
    avatar:
      "https://images.pexels.com/photos/2085247/pexels-photo-2085247.jpeg",
    isFriend: true,
  },
  {
    id: 4,
    name: "Jessica Davis",
    username: "jessdavis",
    avatar: "https://images.pexels.com/photos/818261/pexels-photo-818261.jpeg",
    isFriend: true,
  },
  {
    id: 5,
    name: "David Wilson",
    username: "davewilson",
    avatar:
      "https://images.pexels.com/photos/2092709/pexels-photo-2092709.jpeg",
    isFriend: true,
  },
  {
    id: 6,
    name: "Sarah Miller",
    username: "sarahm",
    avatar:
      "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg",
    isFriend: true,
  },
  // Pengguna yang belum berteman
  {
    id: 7,
    name: "Chris Lee",
    username: "chrisl",
    avatar: "https://i.pravatar.cc/150?img=7",
    isFriend: false, // Menandakan belum berteman
  },
  {
    id: 8,
    name: "Amanda White",
    username: "amandaw",
    avatar: "https://i.pravatar.cc/150?img=8",
    isFriend: false,
  },
  {
    id: 9,
    name: "Kevin Harris",
    username: "kevinh",
    avatar: "https://i.pravatar.cc/150?img=9",
    isFriend: false,
  },
  {
    id: 10,
    name: "Megan Clark",
    username: "megclark",
    avatar: "https://i.pravatar.cc/150?img=10",
    isFriend: false,
  },
];
