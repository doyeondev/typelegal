/**
 * 드래프트 데이터 API 핸들러
 * GET, POST, PUT /api/data/drafting-data
 *
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default function handler(req, res) {
	// 토큰 확인
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({
			success: false,
			message: '인증이 필요합니다.',
		});
	}

	// 요청 메서드에 따라 처리
	switch (req.method) {
		case 'GET':
			return getDraftData(req, res);
		case 'POST':
			return createDraftData(req, res);
		case 'PUT':
			return updateDraftData(req, res);
		default:
			return res.status(405).json({
				success: false,
				message: '허용되지 않는 메서드입니다.',
			});
	}
}

/**
 * 드래프트 데이터 조회
 */
async function getDraftData(req, res) {
	try {
		const { id } = req.query;

		if (!id) {
			return res.status(400).json({
				success: false,
				message: '드래프트 ID가 필요합니다.',
			});
		}

		// TODO: 실제 드래프트 데이터 조회 로직
		// DB에서 드래프트 데이터 조회 등

		// 예시 응답
		return res.status(200).json({
			success: true,
			data: {
				id,
				title: '계약서 드래프트',
				content: '계약서 내용...',
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-02T00:00:00Z',
			},
		});
	} catch (error) {
		console.error('드래프트 데이터 조회 중 오류 발생:', error);
		return res.status(500).json({
			success: false,
			message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
		});
	}
}

/**
 * 드래프트 데이터 생성
 */
async function createDraftData(req, res) {
	try {
		const { title, content } = req.body;

		if (!title || !content) {
			return res.status(400).json({
				success: false,
				message: '제목과 내용이 필요합니다.',
			});
		}

		// TODO: 실제 드래프트 데이터 생성 로직
		// DB에 드래프트 데이터 저장 등

		// 예시 응답
		return res.status(201).json({
			success: true,
			data: {
				id: 'draft-' + Date.now(),
				title,
				content,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			},
			message: '드래프트가 성공적으로 생성되었습니다.',
		});
	} catch (error) {
		console.error('드래프트 데이터 생성 중 오류 발생:', error);
		return res.status(500).json({
			success: false,
			message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
		});
	}
}

/**
 * 드래프트 데이터 업데이트
 */
async function updateDraftData(req, res) {
	try {
		const { id, title, content } = req.body;

		if (!id) {
			return res.status(400).json({
				success: false,
				message: '드래프트 ID가 필요합니다.',
			});
		}

		// TODO: 실제 드래프트 데이터 업데이트 로직
		// DB에서 드래프트 데이터 업데이트 등

		// 예시 응답
		return res.status(200).json({
			success: true,
			data: {
				id,
				title: title || '계약서 드래프트',
				content: content || '계약서 내용...',
				created_at: '2023-01-01T00:00:00Z',
				updated_at: new Date().toISOString(),
			},
			message: '드래프트가 성공적으로 업데이트되었습니다.',
		});
	} catch (error) {
		console.error('드래프트 데이터 업데이트 중 오류 발생:', error);
		return res.status(500).json({
			success: false,
			message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
		});
	}
}
