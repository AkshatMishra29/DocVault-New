import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { Deadline } from './deadline.model.js';

const router = Router();

// GET /api/deadlines - Get all user deadlines
router.get('/', requireAuth, async (req, res) => {
  try {
    const deadlines = await Deadline.find({ userId: req.user.userId }).populate('linkedDocId').sort({ date: 1 });
    res.json({ success: true, data: deadlines });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/deadlines/calendar.ics - Export standard iCalendar file (Apple/Google sync)
router.get('/calendar.ics', async (req, res) => {
  try {
    const filter = req.user?.userId ? { userId: req.user.userId } : {};
    const deadlines = await Deadline.find(filter).sort({ date: 1 });

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//DocVault//Renewal Deadlines//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    const todayStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    for (const item of deadlines) {
      if (!item.date) continue;
      const cleanDate = item.date.replace(/-/g, '').slice(0, 8);
      const uid = `${item._id}@docvault.app`;
      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${todayStr}`,
        `DTSTART;VALUE=DATE:${cleanDate}`,
        `SUMMARY:DocVault Reminder: ${item.title.replace(/[\r\n]/g, ' ')}`,
        `DESCRIPTION:${(item.action || 'Renew document').replace(/[\r\n]/g, ' ')}. Days remaining: ${item.daysLeft}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    }

    lines.push('END:VCALENDAR');
    const icsContent = lines.join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="docvault-deadlines.ics"');
    res.send(icsContent);
  } catch (err) {
    res.status(500).send('Error generating calendar file');
  }
});

export default router;

