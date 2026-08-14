import fetch from 'node-fetch';
import { roomStore } from '../store/roomStore.js';

export const streamVideo = async (req, res) => {
  const { roomId } = req.query;

  if (!roomId) {
    return res.status(400).json({ error: 'roomId is required' });
  }

  const room = roomStore.findRoom(roomId);

  // Read these only from room memory, never from query parameters.
  const fileId = room?.file?.fileId;
  const accessToken = room?.file?.accessToken;

  if (!fileId || !accessToken) {
    return res.status(404).json({
      error: 'No active room video or Drive credential is available yet',
    });
  }

  try {
    const driveUrl =
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        String(fileId)
      )}?alt=media&confirm=t`;

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    if (req.headers.range) {
      headers.Range = req.headers.range;
    }

    const driveRes = await fetch(driveUrl, { headers });

    if (!driveRes.ok && driveRes.status !== 206) {
      const text = await driveRes.text();
      console.error(`Google Drive Fetch Failed [${driveRes.status}]:`, text);

      return res.status(driveRes.status).json({
        error: 'Drive request failed',
        detail: text,
      });
    }

    res.status(driveRes.status);

    const headersToForward = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
    ];

    headersToForward.forEach((header) => {
      const value = driveRes.headers.get(header);
      if (value) res.setHeader(header, value);
    });

    // Fallback if Google Drive does not provide a MIME type.
    if (!res.getHeader('content-type') && room.file?.mimeType) {
      res.setHeader('Content-Type', room.file.mimeType);
    }

    if (!res.getHeader('accept-ranges')) {
      res.setHeader('Accept-Ranges', 'bytes');
    }

    driveRes.body.pipe(res);
  } catch (err) {
    console.error('Stream proxy error:', err);
    res.status(500).json({ error: 'Proxy failure' });
  }
};