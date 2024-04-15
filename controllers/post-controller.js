const { prisma } = require("../prisma/prisma-client");

const PostController = {
  createPost: async (req, res) => {
    const { content } = req.body;

    const authorId = req.user.userId;

    if (!content) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    try {
      const post = await prisma.post.create({
        data: {
          content,
          authorId,
        },
      });

      res.json(post);
    } catch (error) {
      console.error("Error in createPost:", error);

      res.status(500).json({ error: "There was an error creating the post" });
    }
  },

  getAllPosts: async (req, res) => {
    try {
      const posts = await prisma.post.findMany({
        include: {
          author: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      let count = parseInt(req.query.count);
      if (!count) {
        count = 2;
      }
      const pageCount = Math.ceil(posts.length / count);
      let page = parseInt(req.query.page);
      if (!page) {
        page = 1;
      }
      if (page > pageCount) {
        page = pageCount;
      }

      let postsWithPage = {
        posts: [...posts].slice(page * count - count, page * count),
        page: page,
        pageCount: pageCount,
      };

      res.json(postsWithPage);
    } catch (err) {
      res.status(500).json({ error: "Произошла ошибка при получении постов" });
    }
  },

  deletePost: async (req, res) => {
    const { id } = req.params;

    // Проверка, что пользователь удаляет свой пост
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return res.status(404).json({ error: "Пост не найден" });
    }

    if (post.authorId !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Нет доступа к удалению чужого поста" });
    }

    try {
      const transaction = await prisma.$transaction([
        prisma.post.delete({ where: { id } }),
      ]);

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Что-то пошло не так" });
    }
  },
};

module.exports = PostController;
