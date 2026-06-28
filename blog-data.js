/**
 * blog-data.js — dữ liệu local (dùng khi chưa có Google Sheets)
 * Khi đã setup Sheets xong, file này không còn được dùng nữa.
 *
 * FORMAT MỖI ENTRY:
 * {
 *   id:        "blog18",          // id duy nhất, không trùng
 *   date:      "2025.06.28",      // ngày sự kiện
 *   location:  "Hà Nội",         // địa điểm
 *   layout:    "1",               // "1" | "2" | "3" | "4" | "video"
 *   text: {
 *     en: "Caption English.",
 *     vi: "Caption tiếng Việt.",
 *     ja: "日本語。",
 *   },
 *   mainImages: [                 // tối đa 4 ảnh lớn
 *     { file: "Blog18_1.jpg", ratio: "16:9" },
 *     { file: "Blog18_2.jpg", ratio: "1:1"  },
 *   ],
 *   moreImages: [                 // ảnh thứ 5+ (tuỳ chọn)
 *     { file: "Blog18_3.jpg", ratio: "3:4" },
 *   ],
 *   scrollDir: "horizontal",      // "horizontal" | "vertical"
 *   // Nếu là video:
 *   videoId:    "dQw4w9WgXcQ",
 *   videoRatio: "16:9",           // "16:9" | "9:16"
 * }
 */

const BLOG_DATA = [

  {
    id: "blog1",
    date: "2024.04.13",
    location: "Aeon Hà Đông",
    layout: "3",
    text: {
      en: "That was crazy! I've been going to festivals and being a wibu for so long, yet this is my first time watching a yosakoi dance.",
      vi: "Cháy quá trời luôn. Đi fes bao lâu, wibu bao lâu nay mà giờ mới đi xem mọi người nhảy yosakoi.",
      ja: "めちゃくちゃ盛り上がった！よさこいを生で見たのは今回が初めて。",
    },
    mainImages: [
      { file: "Blog1_2.jpg", ratio: "16:9" },
      { file: "Blog1_1.jpg", ratio: "4:3"  },
      { file: "Blog1_3.jpg", ratio: "4:3"  },
    ],
    moreImages: [
      { file: "Blog1_4.jpg", ratio: "3:4" },
      { file: "Blog1_5.jpg", ratio: "3:4" },
      { file: "Blog1_6.jpg", ratio: "3:4" },
    ],
    scrollDir: "horizontal",
  },

  {
    id: "blog2",
    date: "2024.04.13",
    location: "Công viên Cầu Giấy",
    layout: "2",
    text: {
      en: "Old character, but still looks gorgeous in photos as always. Cardcaptor Sakura photoshoot.",
      vi: "Char cũ nhưng chụp thì vẫn xinh đẹp như thường nè. Shoot Thủ lĩnh thẻ bài Sakura.",
      ja: "昔のキャラだけど、写真を撮るとやっぱり可愛いまま。カードキャプターさくらの撮影。",
    },
    mainImages: [
      { file: "Blog2_1.jpg", ratio: "1:1" },
      { file: "Blog2_2.jpg", ratio: "3:4" },
    ],
    moreImages: [
      { file: "Blog2_3.jpg", ratio: "3:4" },
      { file: "Blog2_4.jpg", ratio: "3:4" },
      { file: "Blog2_5.jpg", ratio: "3:4" },
    ],
    scrollDir: "horizontal",
  },

  {
    id: "blog3",
    date: "2024.03.12",
    location: "Vinacatech",
    layout: "1",
    text: {
      en: "Finished a full branding package for a medical supplies company overnight. Files ready by tomorrow morning.",
      vi: "Xong ngay một chiếc nhận diện thương hiệu trong đêm. Chỉ cần chị báo, sáng mai có file liền.",
      ja: "医療用品会社向けブランディング一式を一晩で仕上げました。",
    },
    mainImages: [
      { file: "Blog3_1.png", ratio: "21:9" },
    ],
    moreImages: [
      { file: "Blog3_2.png", ratio: "21:9" },
      { file: "Blog3_3.png", ratio: "21:9" },
      { file: "Blog3_4.png", ratio: "21:9" },
    ],
    scrollDir: "vertical",
  },

  {
    id: "blog4",
    date: "2024.02.20",
    location: "Ark Night",
    layout: "1",
    text: {
      en: "Shot a super cool cosplay photoshoot of a game character.",
      vi: "Shoot một bộ ảnh cosplay nhân vật game cực ngầu.",
      ja: "ゲームキャラクターの超クールなコスプレ撮影をしました。",
    },
    mainImages: [
      { file: "Blog4_1.jpeg", ratio: "16:9" },
    ],
    moreImages: [
      { file: "Blog4_2.jpg",  ratio: "3:4" },
      { file: "Blog4_3.jpg",  ratio: "3:4" },
      { file: "Blog4_4.jpg",  ratio: "16:9"},
      { file: "Blog4_5.jpg",  ratio: "3:4" },
      { file: "Blog4_6.jpg",  ratio: "3:4" },
      { file: "Blog4_7.jpg",  ratio: "3:4" },
      { file: "Blog4_8.jpg",  ratio: "3:4" },
      { file: "Blog4_9.jpg",  ratio: "3:4" },
      { file: "Blog4_10.jpg", ratio: "3:4" },
      { file: "Blog4_11.jpg", ratio: "3:4" },
      { file: "Blog4_12.jpg", ratio: "3:4" },
    ],
    scrollDir: "horizontal",
  },

  {
    id: "blog5",
    date: "2024.01.28",
    location: "Lona concept",
    layout: "2",
    text: {
      en: "Time to find a new photo for my avatar before the Tet holiday begins!",
      vi: "Kiếm ảnh thay Avatar ngay trước khi nghỉ tết thui nào.",
      ja: "テト休みに入る前に、アバター用の新しい写真を探しちゃおう。",
    },
    mainImages: [
      { file: "Blog5_0.jpg", ratio: "3:4" },
      { file: "Blog5_1.jpg", ratio: "3:4" },
    ],
    moreImages: [
      { file: "Blog5_2.jpg", ratio: "3:4" },
      { file: "Blog5_3.jpg", ratio: "3:4" },
      { file: "Blog5_4.jpg", ratio: "3:4" },
      { file: "Blog5_5.jpg", ratio: "3:4" },
    ],
    scrollDir: "horizontal",
  },

  {
    id: "blog6",
    date: "2024.01.24",
    location: "YEP DETECH BIO",
    layout: "video",
    text: {
      en: "An event marking the end of a year full of hard work and the beginning of an even more explosive new year for DETECH Group and DETECH BIO. Wishing your company a prosperous New Year.",
      vi: "Sự kiện đánh dấu kết thúc một năm nỗ lực và hứa hẹn năm mới bùng cháy hơn nữa của DETECH. Kính chúc quý công ty an khang thịnh vượng.",
      ja: "DETECHグループの一年の締めくくりと新年の始まりを象徴するイベント。貴社のご発展をお祈り申し上げます。",
    },
    videoId:    "g0UgrTV3ZF4",
    videoRatio: "16:9",
  },

  {
    id: "blog7",
    date: "2024.01.11",
    location: "Lona concept",
    layout: "4",
    text: {
      en: "Let's shoot a super cool photoshoot with my cat!",
      vi: "Làm ngay một bộ ảnh cực ngầu cùng với bé mèo nhà mình nào!",
      ja: "うちの猫と一緒に、めっちゃクールな写真を撮ろう！",
    },
    mainImages: [
      { file: "Blog7_1.jpg", ratio: "3:4" },
      { file: "Blog7_2.jpg", ratio: "3:4" },
      { file: "Blog7_3.jpg", ratio: "3:4" },
      { file: "Blog7_4.jpg", ratio: "3:4" },
    ],
  },

  {
    id: "blog8",
    date: "2024.01.06",
    location: "T-Lab VietNam",
    layout: "2",
    text: {
      en: "Another year-end party with T-Lab Vietnam.",
      vi: "Thêm một chiếc year end party cùng với T-Lab Việt Nam.",
      ja: "T-Lab Vietnam と一緒に、もうひとつのイヤーエンドパーティー！",
    },
    mainImages: [
      { file: "Blog8_1.JPG", ratio: "16:9" },
      { file: "Blog8_2.JPG", ratio: "16:9" },
    ],
  },

  {
    id: "blog9",
    date: "2024.01.01",
    location: "Oola Vĩnh Phúc",
    layout: "3",
    text: {
      en: "Kickstarting the New Year with Oola Coffee.",
      vi: "Khởi động năm mới cùng với Oola.",
      ja: "Oola Coffee と一緒に、新しい一年をスタート！",
    },
    mainImages: [
      { file: "Blog9_1.jpg", ratio: "16:9" },
      { file: "Blog9_2.jpg", ratio: "1:1"  },
      { file: "Blog9_3.jpg", ratio: "1:1"  },
    ],
    moreImages: [
      { file: "Blog9_4.jpg", ratio: "1:1" },
      { file: "Blog9_5.jpg", ratio: "16:9"},
      { file: "Blog9_6.jpg", ratio: "16:9"},
      { file: "Blog9_7.jpg", ratio: "16:9"},
    ],
    scrollDir: "horizontal",
  },

  {
    id: "blog10",
    date: "2023.11.27",
    location: "T-Lab VietNam",
    layout: "video",
    text: {
      en: "Not really our specialty, but we went all in. Product photoshoot for T-Lab.",
      vi: "Không phải sở trường nhưng chúng em vẫn triển hết. Chụp sản phẩm T-Lab.",
      ja: "得意分野ではありませんが全力でやりました。T-Lab の商品撮影に挑戦！",
    },
    videoId:    "IXLj2PChBoQ",
    videoRatio: "9:16",
  },

  {
    id: "blog11",
    date: "2023.10",
    location: "KOMI Artist Fair",
    layout: "3",
    text: {
      en: "Every time I get some free time, I end up with new photos from cosplay festivals.",
      vi: "Rảnh rảnh là lại có ảnh đi chơi fes nè.",
      ja: "暇さえあれば、またコスプレイベントの写真が増えちゃう。",
    },
    mainImages: [
      { file: "Blog11_2.jpg", ratio: "16:9" },
      { file: "Blog11_1.jpg", ratio: "3:4"  },
      { file: "Blog11_3.jpg", ratio: "3:4"  },
    ],
  },

  {
    id: "blog12",
    date: "2023.10.20",
    location: "Học Làm Sếp",
    layout: "3",
    text: {
      en: "Morning at the company, afternoon helping the bosses with a smile.",
      vi: "Sáng làm công ty chiều em vẫn đi phục vụ các sếp vô tư ạ.",
      ja: "午前は会社で働き、午後は上司のお手伝い。",
    },
    mainImages: [
      { file: "Blog12_1.jpg", ratio: "16:9" },
      { file: "Blog12_2.jpg", ratio: "3:4"  },
      { file: "Blog12_3.jpg", ratio: "4:3"  },
    ],
    moreImages: [
      { file: "Blog12_4.jpg", ratio: "16:9" },
      { file: "Blog12_5.jpg", ratio: "16:9" },
    ],
    scrollDir: "horizontal",
  },

  {
    id: "blog13",
    date: "2023.10.12",
    location: "Teky Studio",
    layout: "1",
    text: {
      en: "Switched over to profile photo shoots for the education sector.",
      vi: "Chuyển qua chạy kèo chụp ảnh profile cho mảng giáo dục.",
      ja: "教育分野のプロフィール撮影の案件に移りました。",
    },
    mainImages: [
      { file: "Blog13_1.JPG", ratio: "3:4" },
    ],
    moreImages: [
      { file: "Blog13_2.JPG", ratio: "3:4" },
      { file: "Blog13_3.JPG", ratio: "16:9"},
      { file: "Blog13_4.JPG", ratio: "3:4" },
      { file: "Blog13_5.JPG", ratio: "3:4" },
      { file: "Blog13_6.JPG", ratio: "16:9"},
      { file: "Blog13_7.JPG", ratio: "16:9"},
      { file: "Blog13_8.JPG", ratio: "16:9"},
    ],
    scrollDir: "horizontal",
  },

  {
    id: "blog14",
    date: "2023.10.10",
    location: "Teky Studio",
    layout: "4",
    text: {
      en: "Some cute profile portraits of the lovely students.",
      vi: "Chút ảnh chân dung profile của các bé sinh viên đáng yêu nè.",
      ja: "可愛い学生たちのプロフィール用ポートレートを少しだけ。",
    },
    mainImages: [
      { file: "Blog14_2.JPG", ratio: "3:4" },
      { file: "Blog14_3.JPG", ratio: "3:4" },
      { file: "Blog14_4.JPG", ratio: "3:4" },
      { file: "Blog14_5.JPG", ratio: "3:4" },
    ],
    moreImages: [
      { file: "Blog14_1.JPG", ratio: "21:9" },
    ],
    scrollDir: "vertical",
  },

  {
    id: "blog15",
    date: "2023.09.10",
    location: "The Dream",
    layout: "4",
    text: {
      en: "Some of the top-tier cosplayers from The Dream 2023.",
      vi: "Một vài bạn cosplayer đỉnh chóp của The Dream 2023.",
      ja: "The Dream 2023 の激アツなコスプレイヤーたちを少しご紹介。",
    },
    mainImages: [
      { file: "Blog15_1.jpg", ratio: "3:4" },
      { file: "Blog15_2.jpg", ratio: "3:4" },
      { file: "Blog15_3.jpg", ratio: "3:4" },
      { file: "Blog15_4.jpg", ratio: "3:4" },
    ],
    moreImages: [
      { file: "Blog15_5.jpg", ratio: "3:4" },
      { file: "Blog15_6.jpg", ratio: "3:4" },
      { file: "Blog15_7.jpg", ratio: "3:4" },
      { file: "Blog15_8.jpg", ratio: "3:4" },
    ],
    scrollDir: "horizontal",
  },

  {
    id: "blog16",
    date: "2023.09.03",
    location: "Kagami fes",
    layout: "3",
    text: {
      en: "I ran into a super cool Joker &amp; Harley Quinn duo at Kagami fes.",
      vi: "Mình gặp đôi Joker &amp; Harley Quinn cực chất tại fes Kagami nè.",
      ja: "KagamiフェスでクールなジョーカーとハーレイのペアQに出会いました。",
    },
    mainImages: [
      { file: "Blog16_1.jpg", ratio: "16:9" },
      { file: "Blog16_4.jpg", ratio: "3:4"  },
      { file: "Blog16_5.jpg", ratio: "3:4"  },
    ],
    moreImages: [
      { file: "Blog16_2.jpg",  ratio: "16:9" },
      { file: "Blog16_3.jpg",  ratio: "16:9" },
      { file: "Blog16_6.jpg",  ratio: "3:4"  },
      { file: "Blog16_7.jpg",  ratio: "3:4"  },
      { file: "Blog16_8.jpg",  ratio: "3:4"  },
      { file: "Blog16_9.jpg",  ratio: "3:4"  },
      { file: "Blog16_10.jpg", ratio: "3:4"  },
      { file: "Blog16_11.jpg", ratio: "3:4"  },
    ],
    scrollDir: "horizontal",
  },

  {
    id: "blog17",
    date: "2023.07.18",
    location: "Đê Long Biên",
    layout: "1",
    text: {
      en: "Not only at events — sometimes I also do concept shoots like this.",
      vi: "Không chỉ ở các sự kiện, đôi khi mình cũng có những buổi chụp concept như thế này.",
      ja: "イベントだけじゃなく、コンセプト撮影もしています。",
    },
    mainImages: [
      { file: "Blog17_1.jpg", ratio: "16:9" },
    ],
    moreImages: [
      { file: "Blog17_2.jpg", ratio: "3:4" },
      { file: "Blog17_3.jpg", ratio: "3:4" },
      { file: "Blog17_4.jpg", ratio: "3:4" },
      { file: "Blog17_5.jpg", ratio: "3:4" },
      { file: "Blog17_6.jpg", ratio: "3:4" },
      { file: "Blog17_7.jpg", ratio: "3:4" },
    ],
    scrollDir: "horizontal",
  },

];
