const express = require('express');
const User = require('../schemas/user');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth-middleware');
const { body, validationResult } = require('express-validator');

router.get('/', (req, res) => {
  res.send('this is root page');
});

//아이디 중복 검사(중복확인 버튼 누르면 실행)//
router.post(
  "/idCheck", 
  // notEmpty: 비어있으면 컷!, trim: 공백없애기, isLength: 문자길이지정, isAlphanumeric: 숫자와 문자만 있는지 체크
  body('userId')
    .notEmpty()
    .withMessage('아이디를 입력해주세요.')
    .trim()
    .isLength({ min: 4 })
    .withMessage('아이디가 4글자 이상인지 확인해주세요.')
    .isAlphanumeric()
    .withMessage('아이디는 영문과 숫자만 사용가능합니다.')
    .custom(value => {
      return User.find(value).then(user => {
        if (user) {
          return Promise.reject('이미 중복된 아이디가 있습니다.');
        }
      });
    }),
    async (req, res) => {
      //요청에 검증에러가 있으면 찾아줌
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

  res.status(201).send("사용할 수 있는 아이디입니다.")
});


// 회원가입 //
router.post(
  "/signup",
  //닉네임 중복 검사
  body('userName')
    .notEmpty()
    .trim()
    .custom(value => {
      return User.find(value).then(user => {
        if (user) {
          return Promise.reject('이미 중복된 닉네임이 있습니다.');
        }
      });
    }),
  // 비밀번호는 최소 4자 이상이며, 닉네임과 같은 값이 포함된 경우 회원가입에 실패로 만들기
  body('password')
    .notEmpty()
    .trim()
    .isLength({ min: 4 })
    .custom((value, { req }) => {
      if (value.includes(req.body.userName)) {
        throw new Error('비밀번호에 닉네임이 포함되어 있습니다.');
      }
      return true;
    }),

  // 비밀번호와 비밀번호 확인이 정확하게 일치하는지 확인
  body('pwConfirm').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('비밀번호와 비밀번호확인이 동일한지 확인해주세요.');
    }
    return true;
  }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  const { userId, password, pwConfirm, userName, gender, userProfile } = req.body;
  
  const user = new User({ userId, password, userName, gender, userProfile});
  await user.save();

  res.status(201).send("회원가입 성공!")
});

//로그인//
router.post('/login', async (req, res) => {
  const { userId, password } = req.body;

  const user = await User.findOne({ userId, password }).exec();

  if (!user) {
      res.status(400).send({
          errorMessage: '아이디 또는 패스워드를 확인해주세요',
      });
      return;
  }
  const token = jwt.sign({ jwtId: user.jwtId }, 'chuchoenhaejuot');
  res.send({
      token,
  });
});

//내 정보조회//
router.get('/auth', authMiddleware, async (req, res) => {
  //locals에 있는 사용자정보 가져오기
  const { user } = res.locals;
  res.send({
      user,
  });
});

module.exports = router;