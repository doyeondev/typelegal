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
	exports.id = 'pages/api/test';
	exports.ids = ['pages/api/test'];
	exports.modules = {
		/***/ axios:
			/*!************************!*\
  !*** external "axios" ***!
  \************************/
			/***/ module => {
				module.exports = require('axios');

				/***/
			},

		/***/ '(api)/./pages/api/test.js':
			/*!***************************!*\
  !*** ./pages/api/test.js ***!
  \***************************/
			/***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
				eval(
					'__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   "default": () => (/* binding */ handle)\n/* harmony export */ });\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "axios");\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);\n\nasync function handle(req, res) {\n    const axios = __webpack_require__(/*! axios */ "axios");\n    const API_BASE_URL = "http://localhost:8082/api";\n    // const { userName, userEmail, userPhone, activationKey } = req.body\n    // http://localhost:8082/api/directus/clause-template\n    // http://localhost:8082/api/directus/question-template\n    axios({\n        url: `${API_BASE_URL}/directus/question-template`,\n        method: "GET"\n    })// 성공했을 경우\n    .then((response)=>{\n        res.status(200).json(response.data);\n    // return data\n    })// 실패했을 경우\n    .catch((err)=>{\n        console.error(err);\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9wYWdlcy9hcGkvdGVzdC5qcy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBMEI7QUFFWCxlQUFlQyxPQUFPQyxHQUFHLEVBQUVDLEdBQUcsRUFBRTtJQUM5QyxNQUFNSCxRQUFRSSxtQkFBT0EsQ0FBQztJQUN0QixNQUFNQyxlQUFlO0lBQ3JCLHFFQUFxRTtJQUNyRSxxREFBcUQ7SUFDckQsdURBQXVEO0lBRXZETCxNQUFNO1FBQ0xNLEtBQUssQ0FBQyxFQUFFRCxhQUFhLDJCQUEyQixDQUFDO1FBQ2pERSxRQUFRO0lBQ1QsRUFDQyxVQUFVO0tBQ1RDLElBQUksQ0FBQ0MsQ0FBQUEsV0FBWTtRQUNqQk4sSUFBSU8sTUFBTSxDQUFDLEtBQUtDLElBQUksQ0FBQ0YsU0FBU0csSUFBSTtJQUNsQyxjQUFjO0lBQ2YsRUFDQSxVQUFVO0tBQ1RDLEtBQUssQ0FBQ0MsQ0FBQUEsTUFBTztRQUNiQyxRQUFRQyxLQUFLLENBQUNGO0lBQ2Y7QUFDRixDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdHlwZS1sZWdhbC8uL3BhZ2VzL2FwaS90ZXN0LmpzPzZlN2EiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlKHJlcSwgcmVzKSB7XG5cdGNvbnN0IGF4aW9zID0gcmVxdWlyZSgnYXhpb3MnKTtcblx0Y29uc3QgQVBJX0JBU0VfVVJMID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9hcGknO1xuXHQvLyBjb25zdCB7IHVzZXJOYW1lLCB1c2VyRW1haWwsIHVzZXJQaG9uZSwgYWN0aXZhdGlvbktleSB9ID0gcmVxLmJvZHlcblx0Ly8gaHR0cDovL2xvY2FsaG9zdDo4MDgwL2FwaS9kaXJlY3R1cy9jbGF1c2UtdGVtcGxhdGVcblx0Ly8gaHR0cDovL2xvY2FsaG9zdDo4MDgwL2FwaS9kaXJlY3R1cy9xdWVzdGlvbi10ZW1wbGF0ZVxuXG5cdGF4aW9zKHtcblx0XHR1cmw6IGAke0FQSV9CQVNFX1VSTH0vZGlyZWN0dXMvcXVlc3Rpb24tdGVtcGxhdGVgLFxuXHRcdG1ldGhvZDogJ0dFVCcsXG5cdH0pXG5cdFx0Ly8g7ISx6rO17ZaI7J2EIOqyveyasFxuXHRcdC50aGVuKHJlc3BvbnNlID0+IHtcblx0XHRcdHJlcy5zdGF0dXMoMjAwKS5qc29uKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0Ly8gcmV0dXJuIGRhdGFcblx0XHR9KVxuXHRcdC8vIOyLpO2MqO2WiOydhCDqsr3smrBcblx0XHQuY2F0Y2goZXJyID0+IHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHR9KTtcbn1cbiJdLCJuYW1lcyI6WyJheGlvcyIsImhhbmRsZSIsInJlcSIsInJlcyIsInJlcXVpcmUiLCJBUElfQkFTRV9VUkwiLCJ1cmwiLCJtZXRob2QiLCJ0aGVuIiwicmVzcG9uc2UiLCJzdGF0dXMiLCJqc29uIiwiZGF0YSIsImNhdGNoIiwiZXJyIiwiY29uc29sZSIsImVycm9yIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(api)/./pages/api/test.js\n'
				);

				/***/
			},
	};
	// load runtime
	var __webpack_require__ = require('../../webpack-api-runtime.js');
	__webpack_require__.C(exports);
	var __webpack_exec__ = moduleId => __webpack_require__((__webpack_require__.s = moduleId));
	var __webpack_exports__ = __webpack_exec__('(api)/./pages/api/test.js');
	module.exports = __webpack_exports__;
})();
