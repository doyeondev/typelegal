/**
 * 자동 이메일 발송 API 핸들러
 * POST /api/email/sendAutoEmail
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
		const { templateId, recipientEmail, variables, eventType } = req.body;

		// 필수 필드 검증
		if (!templateId || !recipientEmail) {
			return res.status(400).json({
				success: false,
				message: '템플릿 ID와 수신자 이메일은 필수 항목입니다.',
			});
		}

		// 이메일 발송 로깅
		console.log(`[자동 이메일 발송 요청] 템플릿: ${templateId}, 수신자: ${recipientEmail}, 이벤트: ${eventType || '지정되지 않음'}`);

		// 템플릿 ID에 따른 이메일 제목 매핑 (예시)
		const templateSubjects = {
			welcome: '환영합니다!',
			'password-reset': '비밀번호 재설정 안내',
			'account-verification': '계정 인증 안내',
			'contract-signed': '계약서 서명 완료 안내',
			'contract-shared': '계약서 공유 안내',
		};

		const subject = templateSubjects[templateId] || '자동 발송 이메일';

		// TODO: 실제 이메일 발송 로직
		// 이메일 서비스 (SendGrid, Nodemailer 등) 연동 및 템플릿 처리

		// 성공 응답
		return res.status(200).json({
			success: true,
			message: '자동 이메일이 성공적으로 전송되었습니다.',
			data: {
				messageId: `email-auto-${Date.now()}`,
				templateId,
				subject,
				sentAt: new Date().toISOString(),
			},
		});
	} catch (error) {
		console.error('자동 이메일 발송 중 오류 발생:', error);
		return res.status(500).json({
			success: false,
			message: '서버 오류가 발생했습니다. 이메일을 전송하지 못했습니다.',
		});
	}
}
