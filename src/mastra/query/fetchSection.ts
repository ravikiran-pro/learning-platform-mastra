import { pool } from "../config";

export async function fetchSection({ trackId, moduleId, chapterId, sectionId }: { trackId: string, moduleId: string, chapterId: string, sectionId: string }) {
  const query = `
    SELECT
      -- Track
      t.id AS "trackId",
      t.title AS "trackTitle",
      t.slug AS "trackSlug",
      t.description AS "trackDescription",

      -- Module
      m.id AS "moduleId",
      m.title AS "moduleTitle",
      m.description AS "moduleDescription",
      m.order_index AS "moduleOrder",

      -- Chapter
      c.id AS "chapterId",
      c.title AS "chapterTitle",
      c.description AS "chapterDescription",
      c.order_index AS "chapterOrder",

      -- Section
      s.id AS "sectionId",
      s.title AS "sectionTitle",
      s.slug AS "sectionSlug",
      s.description AS "sectionDescription",
      s.order_index AS "sectionOrder",
      s.difficulty,
      s.tags,
      s.content_document_id AS "contentDocumentId"

    FROM tracks t
    JOIN modules m ON m.track_id = t.id
    JOIN chapters c ON c.module_id = m.id
    JOIN sections s ON s.chapter_id = c.id
    WHERE
      t.id = $1
      AND m.id = $2
      AND c.id = $3
      AND s.id = $4
    LIMIT 1;
  `;

  const values = [trackId, moduleId, chapterId, sectionId];

  const result = await pool.query(query, values);
  if (!result.rowCount) return null;

  const data = result.rows[0];

  return {
    track: {
      id: data.trackId,
      title: data.trackTitle,
      slug: data.trackSlug,
      description: data.trackDescription,
    },
    module: {
      id: data.moduleId,
      title: data.moduleTitle,
      description: data.moduleDescription,
      order: data.moduleOrder,
    },
    chapter: {
      id: data.chapterId,
      title: data.chapterTitle,
      description: data.chapterDescription,
      order: data.chapterOrder,
    },
    section: {
      id: data.sectionId,
      title: data.sectionTitle,
      slug: data.sectionSlug,
      description: data.sectionDescription,
      order: data.sectionOrder,
      difficulty: data.difficulty,
      tags: data.tags || [],
      contentDocumentId: data.contentDocumentId,
    }
  };


}
