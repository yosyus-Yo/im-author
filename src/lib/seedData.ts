import type { StoredBook } from './bookStorage'

const BOOKS_KEY = 'ai-book-agent.books'
const USER_KEY = 'ai-book-agent.demo-user'

function ensureDemoUser(): string {
  const raw = window.localStorage.getItem(USER_KEY)
  if (raw) {
    const parsed = JSON.parse(raw) as { id?: string }
    if (parsed.id) return parsed.id
  }
  const id = crypto.randomUUID()
  window.localStorage.setItem(USER_KEY, JSON.stringify({ id }))
  return id
}

export function seedInitialData(): void {
  const existing = window.localStorage.getItem(BOOKS_KEY)
  if (existing) {
    const books = JSON.parse(existing) as StoredBook[]
    if (books.length > 0) return
  }

  const userId = ensureDemoUser()
  const now = new Date().toISOString()

  const books: StoredBook[] = [
    {
      id: crypto.randomUUID(),
      user_id: userId,
      genre: 'nonfiction',
      topic: 'AI와 글쓰기의 미래',
      title: 'AI 시대의 글쓰기 혁명',
      subtitle: '인공지능과 함께하는 창작의 새로운 지평',
      synopsis: null,
      outline: null,
      chapters: [
        {
          chapterNumber: 1,
          title: '인공지능과 글쓰기의 새로운 지평',
          content: `## 글쓰기의 역사적 전환점

우리는 지금 글쓰기의 역사에서 가장 혁명적인 전환점에 서 있다. 인공지능 기술의 급격한 발전은 단순히 도구의 변화를 넘어, 창작 행위의 본질적인 의미를 다시 묻게 만들고 있다.

불과 몇 년 전만 해도 AI가 시를 쓰고 소설을 완성한다는 것은 공상과학의 영역이었다. 하지만 오늘날 대형 언어 모델은 인간과 구별하기 어려운 수준의 텍스트를 생성한다.

## AI는 적이 아니라 협업자

AI는 작가의 적이 아니라 가장 유능한 협업자다. 리서치에 수십 시간을 쏟던 작업이 이제 몇 분으로 단축된다. 초고를 막막하게 바라보던 빈 페이지 공포증은 AI의 첫 문장 제안으로 극복된다.

그러나 AI 글쓰기 혁명의 핵심은 기술이 아니라 인간의 창의성이다. AI는 패턴을 학습하고 텍스트를 조합하지만, 무엇을 쓸 것인가라는 근본적인 질문은 여전히 인간의 몫이다.

## 미래를 향하여

이 책은 AI 시대에 더욱 강력해진 글쓰기의 기술을 탐구한다. 글쓰기의 미래는 AI가 대체하는 세계가 아니라, 인간과 AI가 함께 창조하는 세계다.`,
          wordCount: 250,
          selfEditLog: [],
          revision: 0,
        },
      ],
      publication: null,
      score: 8.5,
      is_published: true,
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      updated_at: now,
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      genre: 'mystery',
      topic: '서울 지하철 실종 사건',
      title: '지하철의 그림자',
      subtitle: '박도윤 형사 시리즈 1편',
      synopsis: null,
      outline: null,
      chapters: [
        {
          chapterNumber: 1,
          title: '새벽 두 시의 지하철',
          content: `## 플랫폼의 가방

지하철 2호선 막차가 신도림역을 떠난 지 정확히 3분이 지났을 때, 형사 박도윤은 플랫폼 끝에 놓인 가방 하나를 발견했다.

검은색 가죽 서류 가방. 잠금장치가 열려 있었다. 안에는 서류 묶음과 함께 휴대폰 한 대, 그리고 누군가의 명함이 들어 있었다. 명함의 주인은 '국가정보원 특수수사팀장 이강민'이었다.

## 익사체와의 연결

문제는 이강민이 바로 그날 오후 한강에서 익사체로 발견되었다는 사실이었다. 박도윤은 가방을 건드리지 않고 스마트폰을 꺼내 사진을 찍었다. CCTV 사각지대를 미리 파악하고 증거를 남기는 것—10년간 형사 생활에서 몸에 밴 습관이었다.

'누군가 일부러 놓고 갔거나, 아니면 급하게 도망치다 두고 갔거나.' 두 가지 가능성이 머릿속에서 충돌했다.

## 여섯 글자의 메시지

그날 오후 이강민이 그에게 문자를 보냈다. 단 여섯 글자였다.

'지하철 그림자를 찾아라.'

역사 밖으로 빠져나가는 바람이 서늘하게 플랫폼을 훑고 지나갔다. 박도윤은 가방을 집어 들었다. 어디선가 발소리가 들렸다. 한 사람이 아니었다.`,
          wordCount: 280,
          selfEditLog: [],
          revision: 0,
        },
      ],
      publication: null,
      score: 9.2,
      is_published: true,
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      updated_at: now,
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      genre: 'sf',
      topic: '은하 제국, 계승자, 음모',
      title: '별들의 계승자',
      subtitle: '은하 제국 연대기 1부',
      synopsis: null,
      outline: null,
      chapters: [
        {
          chapterNumber: 1,
          title: '마지막 계승 의식',
          content: `## 두 태양의 행성

항성력 3847년. 오리온 팔 끝자락에 위치한 행성 세라티스의 하늘에는 두 개의 태양이 붉게 타오르고 있었다. 카이 아넬은 수백 년 된 석조 전당 앞에 무릎을 꿇고 있었다.

## 별의 현자

"별들의 계승자여." 노인의 목소리는 낮고 깊었다. 마지막 별의 현자, 오로스 대사제가 그의 앞에 서 있었다. 삼천 년의 나이를 가진 존재가 뿜어내는 기운은 두 태양의 열기보다 더 뜨거웠다.

"은하 제국의 열두 행성이 어둠에 잠겼다. 다크매터 폭풍이 항법 시스템을 삼켰고, 양자 통신망은 침묵했다. 너는 선택받은 자다."

## 숨겨진 진실

카이는 고개를 들었다. 그의 눈동자는 이미 희미한 은빛으로 빛나고 있었다. 계승 코드가 그의 신경망과 공명하기 시작한 것이었다. 수십억 명의 기억이 파도처럼 밀려오고 있었다.

그런데 그 순간, 그는 이상한 것을 느꼈다. 기억들 사이에서 하나의 진실이 번뜩였다. 제국의 몰락은 우연이 아니었다. 누군가 의도적으로 설계한 것이었다.`,
          wordCount: 260,
          selfEditLog: [],
          revision: 0,
        },
      ],
      publication: null,
      score: 0,
      is_published: false,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: now,
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      genre: 'romance',
      topic: '카페에서 시작된 사랑',
      title: '라떼 한 잔의 온도',
      subtitle: '',
      synopsis: null,
      outline: null,
      chapters: [
        {
          chapterNumber: 1,
          title: '비 오는 화요일',
          content: `## 젖은 우산

서연은 항상 화요일이 싫었다. 월요일의 긴장감도, 금요일의 기대감도 없는 어중간한 요일. 그런 화요일 오후, 빗줄기가 거세지는 종로 뒷골목에서 그녀는 낡은 간판의 카페에 뛰어들었다.

'PAUSE'라고 적힌 간판 아래, 종소리와 함께 문이 열렸다. 원두를 갈고 있던 남자가 고개를 들었다. 짧은 머리, 앞치마에 묻은 커피 얼룩, 그리고 약간 놀란 듯한 눈.

## 첫 번째 라떼

"라떼 한 잔 주세요." 서연은 젖은 머리카락을 쓸어 넘기며 말했다.

그가 만든 라떼는 이상하게 따뜻했다. 커피의 온도가 아니라, 잔을 건네는 손끝에서 전해지는 어떤 온기. 서연은 첫 모금을 마시며 창밖을 보았다. 빗방울이 유리창에 부딪히며 만들어내는 무늬가 마치 누군가의 손글씨 같았다.

"저, 이거 무슨 원두예요?" 서연이 물었다.

"비 오는 날에만 쓰는 블렌드예요." 그가 미소 지었다.

그 미소가 마음에 남았다. 서연은 다음 화요일에도 그 카페를 찾았다.`,
          wordCount: 240,
          selfEditLog: [],
          revision: 0,
        },
      ],
      publication: null,
      score: 7.8,
      is_published: true,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: now,
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      genre: 'essay',
      topic: '일상에서 발견하는 행복',
      title: '오늘도 괜찮은 하루',
      subtitle: '작은 것들의 아름다움에 대하여',
      synopsis: null,
      outline: null,
      chapters: [
        {
          chapterNumber: 1,
          title: '아침 산책의 기쁨',
          content: `## 새벽 다섯 시

요즘 나는 새벽 다섯 시에 일어난다. 의무감이 아니라 기대감 때문이다. 창문을 열면 아직 세상이 잠들어 있는 시간, 공기는 차갑지만 맑고 하늘은 회색에서 분홍으로 천천히 물들어간다.

운동화 끈을 묶고 현관문을 나서면, 동네 골목길이 온전히 나만의 것이 된다. 출근길의 소음도, 알림 소리도 없는 이 시간은 하루 중 가장 솔직한 시간이다.

## 작은 것들의 발견

산책길에서 나는 작은 것들을 발견한다. 담장 위에 앉아 그루밍하는 고양이, 이름 모를 꽃의 봉오리가 어제보다 조금 더 벌어진 것, 빵집에서 흘러나오는 첫 번째 빵 냄새. 이런 것들이 하루를 버티는 힘이 된다.

행복은 거창한 것이 아니다. 아침 산책에서 발견하는 작은 아름다움이 쌓여 괜찮은 하루가 되고, 괜찮은 하루가 모여 괜찮은 인생이 된다.`,
          wordCount: 230,
          selfEditLog: [],
          revision: 0,
        },
      ],
      publication: null,
      score: 8.0,
      is_published: true,
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: now,
    },
  ]

  window.localStorage.setItem(BOOKS_KEY, JSON.stringify(books))
}
