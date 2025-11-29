import { pool } from "../config";

export async function fetcAllTrackDetails({ trackId }: { trackId: string }) {
  const query = `
    SELECT
      t.id AS "trackId",
      t.title AS "trackTitle",
      t.slug AS "trackSlug",

      m.id AS "moduleId",
      m.title AS "moduleTitle",
      m.order_index AS "moduleOrder",

      c.id AS "chapterId",
      c.title AS "chapterTitle",
      c.order_index AS "chapterOrder",

      s.id AS "sectionId",
      s.title AS "sectionTitle",
      s.slug AS "sectionSlug",
      s.order_index AS "sectionOrder",
      s.difficulty,
      s.tags,
      s.content_document_id AS "contentDocumentId"
    FROM tracks t
    JOIN modules m ON m.track_id = t.id
    JOIN chapters c ON c.module_id = m.id
    JOIN sections s ON s.chapter_id = c.id
    WHERE t.id = $1
    ORDER BY m.order_index, c.order_index, s.order_index;
  `;

  const result = await pool.query(query, [trackId]);
  if (!result.rowCount) return null;

  const rows = result.rows;

  // Create empty structure
  const track: any = {
    trackId: rows[0].trackId,
    trackTitle: rows[0].trackTitle,
    trackSlug: rows[0].trackSlug,
    modules: []
  };

  const moduleMap: Record<string, any> = {};
  const chapterMap: Record<string, any> = {};

  for (const row of rows) {
    // MODULES
    if (!moduleMap[row.moduleId]) {
      moduleMap[row.moduleId] = {
        moduleId: row.moduleId,
        moduleTitle: row.moduleTitle,
        moduleOrder: row.moduleOrder,
        chapters: []
      };
      track.modules.push(moduleMap[row.moduleId]);
    }

    // CHAPTERS
    if (!chapterMap[row.chapterId]) {
      chapterMap[row.chapterId] = {
        chapterId: row.chapterId,
        chapterTitle: row.chapterTitle,
        chapterOrder: row.chapterOrder,
        sections: []
      };
      moduleMap[row.moduleId].chapters.push(chapterMap[row.chapterId]);
    }

    // SECTIONS
    chapterMap[row.chapterId].sections.push({
      sectionId: row.sectionId,
      title: row.sectionTitle,
      slug: row.sectionSlug,
      order: row.sectionOrder,
      difficulty: row.difficulty,
      tags: row.tags,
      contentDocumentId: row.contentDocumentId
    });
  }

  return track;
}
