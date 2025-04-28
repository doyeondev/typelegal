/**
 * 이메일 발송 API 핸들러
 * POST /api/email/sendEmail
 *
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default function handler(req, res) {
	// POST 메서드만 허용
	if (req.method !== 'POST') {
		return res.status(405).json({
			success: false,
			message: '허용되지 않는 메서드입니다.',
		});
	}

	try {
		const { to, subject, content, attachments, cc, bcc } = req.body;

		// 필수 필드 검증
		if (!to || !subject || !content) {
			return res.status(400).json({
				success: false,
				message: '받는 사람, 제목, 내용은 필수 항목입니다.',
			});
		}

		// 이메일 발송 로깅
		console.log(`[이메일 발송 요청] 받는 사람: ${to}, 제목: ${subject}`);

		// TODO: 실제 이메일 발송 로직
		// 이메일 서비스 (SendGrid, Nodemailer 등) 연동

		// 성공 응답
		return res.status(200).json({
			success: true,
			message: '이메일이 성공적으로 전송되었습니다.',
			data: {
				messageId: `email-${Date.now()}`,
				sentAt: new Date().toISOString(),
			},
		});
	} catch (error) {
		console.error('이메일 발송 중 오류 발생:', error);
		return res.status(500).json({
			success: false,
			message: '서버 오류가 발생했습니다. 이메일을 전송하지 못했습니다.',
		});
	}
}
