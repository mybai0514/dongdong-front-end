-- 论坛分类初始化数据
-- 插入两个论坛分类：驴酱板块和鱼酱板块

INSERT INTO forum_categories (slug, name, description, icon, color, post_count, created_at)
VALUES
  ('lusty', '驴酱板块', '欢乐时光开始了', '🫏', 'orange', 0, CURRENT_TIMESTAMP),
  ('fishy', '鱼酱板块', '余小c真的很强', '🐟', 'blue', 0, CURRENT_TIMESTAMP);
