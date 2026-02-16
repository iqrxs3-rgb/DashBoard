export const corsOptions = {
  origin: function (origin, callback) {
    // قائمة الـ Origins المسموح بها
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 
      'http://localhost:3000,https://backendbe.up.railway.app,https://beirut.up.railway.app'
    ).split(',').map(o => o.trim());

    // السماح بـ requests بدون origin (مثل mobile apps)
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  optionsSuccessStatus: 200,
  maxAge: 86400 
};

export default corsOptions;