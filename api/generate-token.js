const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 从环境变量读取配置
    const privateKey = process.env.COZE_PRIVATE_KEY;
    const appId = process.env.COZE_APP_ID;
    const kid = process.env.COZE_KID;

    if (!privateKey) {
      return res.status(500).json({ error: 'Private key not configured' });
    }

    // 获取用户ID
    const userId = req.query.user_id || `anonymous_${uuidv4().substr(0, 12)}_${Date.now()}`;

    // 创建JWT payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iat: now,
      exp: now + 600,
      jti: uuidv4(),
      aud: 'api.coze.cn',
      iss: appId,
      session_name: userId
    };

    // 生成JWT
    const token = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      header: { kid }
    });

    res.json({
      token: token,
      expires_in: 600,
      status: 'success'
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      error_type: error.constructor.name
    });
  }
};
