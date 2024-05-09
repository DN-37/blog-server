const { prisma } = require("../prisma/prisma-client");

const CommentController = {
  createComment: async (req, res) => {
    try {
      const { postId, content } = req.body;
      const userId = req.user.userId;

      if (!postId || !content) {
        return res.status(400).json({ error: "Все поля обязательны" });
      }

      const comment = await prisma.comment.create({
        data: {
          postId,
          userId,
          content,
        },
      });

      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Не удалось создать комментарий" });
    }
  },
};

module.exports = CommentController;
