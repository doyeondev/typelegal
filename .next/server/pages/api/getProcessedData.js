'use strict';
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
	var exports = {};
	exports.id = 'pages/api/getProcessedData';
	exports.ids = ['pages/api/getProcessedData'];
	exports.modules = {
		/***/ axios:
			/*!************************!*\
  !*** external "axios" ***!
  \************************/
			/***/ module => {
				module.exports = require('axios');

				/***/
			},

		/***/ '(api)/./pages/api/getProcessedData.js':
			/*!***************************************!*\
  !*** ./pages/api/getProcessedData.js ***!
  \***************************************/
			/***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
				eval(
					'__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   "default": () => (/* binding */ handle)\n/* harmony export */ });\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "axios");\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);\n\nasync function handle(req, res) {\n    try {\n        const API_BASE_URL = "http://localhost:8082/api";\n        // 클라이언트에서 query1, query2를 GET 요청 파라미터로 받음\n        const { query1 , query2  } = req.query;\n        // 백엔드 API 호출 (GET 방식)\n        const response = await axios__WEBPACK_IMPORTED_MODULE_0___default().get(`${API_BASE_URL}/data/process`, {\n            params: {\n                query1,\n                query2\n            }\n        });\n        // 성공한 경우 클라이언트에 데이터 반환\n        res.status(200).json(response.data);\n    } catch (error) {\n        console.error("❌ API 요청 실패:", error);\n        res.status(500).json({\n            error: "Internal Server Error"\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9wYWdlcy9hcGkvZ2V0UHJvY2Vzc2VkRGF0YS5qcy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBMEI7QUFFWCxlQUFlQyxPQUFPQyxHQUFHLEVBQUVDLEdBQUcsRUFBRTtJQUM5QyxJQUFJO1FBQ0gsTUFBTUMsZUFBZTtRQUVyQiwwQ0FBMEM7UUFDMUMsTUFBTSxFQUFFQyxPQUFNLEVBQUVDLE9BQU0sRUFBRSxHQUFHSixJQUFJSyxLQUFLO1FBRXBDLHNCQUFzQjtRQUN0QixNQUFNQyxXQUFXLE1BQU1SLGdEQUFTLENBQUMsQ0FBQyxFQUFFSSxhQUFhLGFBQWEsQ0FBQyxFQUFFO1lBQ2hFTSxRQUFRO2dCQUFFTDtnQkFBUUM7WUFBTztRQUMxQjtRQUVBLHVCQUF1QjtRQUN2QkgsSUFBSVEsTUFBTSxDQUFDLEtBQUtDLElBQUksQ0FBQ0osU0FBU0ssSUFBSTtJQUNuQyxFQUFFLE9BQU9DLE9BQU87UUFDZkMsUUFBUUQsS0FBSyxDQUFDLGdCQUFnQkE7UUFDOUJYLElBQUlRLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7WUFBRUUsT0FBTztRQUF3QjtJQUN2RDtBQUNELENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90eXBlLWxlZ2FsLy4vcGFnZXMvYXBpL2dldFByb2Nlc3NlZERhdGEuanM/NGRlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGUocmVxLCByZXMpIHtcblx0dHJ5IHtcblx0XHRjb25zdCBBUElfQkFTRV9VUkwgPSAnaHR0cDovL2xvY2FsaG9zdDo4MDgwL2FwaSc7XG5cblx0XHQvLyDtgbTrnbzsnbTslrjtirjsl5DshJwgcXVlcnkxLCBxdWVyeTLrpbwgR0VUIOyalOyyrSDtjIzrnbzrr7jthLDroZwg67Cb7J2MXG5cdFx0Y29uc3QgeyBxdWVyeTEsIHF1ZXJ5MiB9ID0gcmVxLnF1ZXJ5O1xuXG5cdFx0Ly8g67Cx7JeU65OcIEFQSSDtmLjstpwgKEdFVCDrsKnsi50pXG5cdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQoYCR7QVBJX0JBU0VfVVJMfS9kYXRhL3Byb2Nlc3NgLCB7XG5cdFx0XHRwYXJhbXM6IHsgcXVlcnkxLCBxdWVyeTIgfSwgLy8g7L+866asIO2MjOudvOuvuO2EsCDshKTsoJVcblx0XHR9KTtcblxuXHRcdC8vIOyEseqzte2VnCDqsr3smrAg7YG065287J207Ja47Yq47JeQIOuNsOydtO2EsCDrsJjtmZhcblx0XHRyZXMuc3RhdHVzKDIwMCkuanNvbihyZXNwb25zZS5kYXRhKTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRjb25zb2xlLmVycm9yKCfinYwgQVBJIOyalOyyrSDsi6TtjKg6JywgZXJyb3IpO1xuXHRcdHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InIH0pO1xuXHR9XG59XG4iXSwibmFtZXMiOlsiYXhpb3MiLCJoYW5kbGUiLCJyZXEiLCJyZXMiLCJBUElfQkFTRV9VUkwiLCJxdWVyeTEiLCJxdWVyeTIiLCJxdWVyeSIsInJlc3BvbnNlIiwiZ2V0IiwicGFyYW1zIiwic3RhdHVzIiwianNvbiIsImRhdGEiLCJlcnJvciIsImNvbnNvbGUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(api)/./pages/api/getProcessedData.js\n'
				);

				/***/
			},
	};
	// load runtime
	var __webpack_require__ = require('../../webpack-api-runtime.js');
	__webpack_require__.C(exports);
	var __webpack_exec__ = moduleId => __webpack_require__((__webpack_require__.s = moduleId));
	var __webpack_exports__ = __webpack_exec__('(api)/./pages/api/getProcessedData.js');
	module.exports = __webpack_exports__;
})();
