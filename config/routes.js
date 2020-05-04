module.exports.routes = {
  // Auth API
  'POST /api/v1/auth/token':                 {action: 'ad/token'},
  'POST /api/v1/auth/login':                 {action: 'ad/login'},
  'POST /api/v1/auth/logout':                {action: 'ad/logout'},
};
