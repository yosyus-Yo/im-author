import {
  editorAgent,
  publisherAgent,
  researcherAgent,
  writerAgent,
} from './agents'
import type {
  AgentMessage,
  AgentMessageStatus,
  BookGenre,
  BookProject,
  ChapterDraft,
  EditReview,
} from '../types/agent'

const GENRE_LABELS: Record<BookGenre, string> = {
  nonfiction: '논픽션',
  fantasy: '판타지',
  romance: '로맨스',
  webnovel: '웹소설',
  essay: '수필/에세이',
  autobiography: '자서전/회고록',
  mystery: '미스터리',
  sf: 'SF',
}

function createMessage(
  role: AgentMessage['role'],
  content: string,
  phase: string,
  status: AgentMessageStatus,
): AgentMessage {
  return {
    role,
    content,
    phase,
    status,
    timestamp: new Date(),
  }
}

function countWords(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length
}

export function createEmptyProject(
  topic = '',
  genre: BookGenre | null = null,
): BookProject {
  return {
    topic,
    genre,
    research: null,
    synopsis: null,
    synopsisConfirmed: false,
    outline: null,
    outlineConfirmed: false,
    chapters: [],
    reviews: [],
    publication: null,
    currentPhase: 'idle',
    messages: [],
  }
}

export function buildBookContext(project: BookProject): string {
  const title = project.outline?.title || project.publication?.metadata.title || '미정'
  const synopsis = project.synopsis?.synopsis || '시놉시스 없음'
  const completedChapters = project.chapters.length
    ? project.chapters
        .map(
          (chapter) =>
            `- ${chapter.chapterNumber}장 ${chapter.title} (${chapter.wordCount}단어)`,
        )
        .join('\n')
    : '- 아직 작성된 챕터 없음'

  return `현재 책 상태 요약
- 제목: ${title}
- 주제: ${project.topic || '미정'}
- 장르: ${project.genre ? GENRE_LABELS[project.genre] : '미정'}
- 시놉시스: ${synopsis}
- 현재 단계: ${project.currentPhase}
- 완성 챕터:
${completedChapters}`
}

export function buildChapterContext(
  project: BookProject,
  targetChapter: number,
): string {
  const targetOutline = project.outline?.chapters.find(
    (chapter) => chapter.number === targetChapter,
  )
  const previousChapter = project.chapters.find(
    (chapter) => chapter.chapterNumber === targetChapter - 1,
  )
  const olderChapters = project.chapters.filter(
    (chapter) => chapter.chapterNumber < targetChapter - 1,
  )
  const nextChapters = project.outline?.chapters.filter(
    (chapter) => chapter.number > targetChapter,
  )

  return `챕터 작성 컨텍스트
- 대상 챕터: ${
    targetOutline
      ? `${targetOutline.number}장 ${targetOutline.title} - ${targetOutline.summary}`
      : `${targetChapter}장`
  }

시놉시스:
${project.synopsis?.synopsis || '없음'}

전체 목차:
${JSON.stringify(project.outline?.chapters || [], null, 2)}

직전 챕터 전문:
${previousChapter?.content || '없음'}

그보다 이전 챕터 요약:
${olderChapters.length
    ? olderChapters
        .map(
          (chapter) =>
            `- ${chapter.chapterNumber}장 ${chapter.title}: ${chapter.content.slice(0, 200)}`,
        )
        .join('\n')
    : '없음'}

다음 챕터 방향:
${nextChapters?.length
    ? nextChapters
        .map((chapter) => `- ${chapter.number}장 ${chapter.title}: ${chapter.summary}`)
        .join('\n')
    : '없음'}`
}

export async function runBookPipeline(
  topic: string,
  genre: BookGenre,
  onMessage: (msg: AgentMessage) => void,
  onProjectUpdate: (project: BookProject) => void,
  onConfirmationNeeded?: (phase: 'synopsis' | 'outline', data: unknown) => Promise<boolean>,
): Promise<BookProject> {
  let project = createEmptyProject(topic, genre)

  const updateProject = (updater: (current: BookProject) => BookProject) => {
    project = updater(project)
    onProjectUpdate(project)
  }

  const pushMessage = (
    role: AgentMessage['role'],
    content: string,
    phase: string,
    status: AgentMessageStatus,
  ) => {
    const message = createMessage(role, content, phase, status)
    onMessage(message)
    updateProject((current) => ({
      ...current,
      messages: [...current.messages, message],
    }))
  }

  try {
    updateProject((current) => ({
      ...current,
      currentPhase: 'researching',
    }))
    pushMessage('researcher', '리서처가 주제를 분석하고 있습니다...', 'RESEARCH', 'thinking')

    const research = await researcherAgent.analyzeTopic(topic, {
      genre,
      bookContext: buildBookContext(project),
    })

    updateProject((current) => ({
      ...current,
      research,
    }))
    pushMessage(
      'researcher',
      research.goNoGo === 'GO'
        ? `시장성 분석이 완료되었습니다. 결론은 GO입니다.`
        : `시장성 분석 결과 NO_GO입니다. ${research.reasoning}`,
      'RESEARCH',
      research.goNoGo === 'GO' ? 'done' : 'error',
    )

    if (research.goNoGo === 'NO_GO') {
      updateProject((current) => ({
        ...current,
        currentPhase: 'complete',
      }))

      return project
    }

    updateProject((current) => ({
      ...current,
      currentPhase: 'synopsis',
    }))
    pushMessage('writer', '작가가 시놉시스를 작성하고 있습니다...', 'SYNOPSIS', 'thinking')

    const synopsis = await writerAgent.createSynopsis(topic, research, {
      genre,
      bookContext: buildBookContext(project),
    })

    updateProject((current) => ({
      ...current,
      synopsis,
    }))

    if (onConfirmationNeeded) {
      const confirmed = await onConfirmationNeeded('synopsis', synopsis)
      if (!confirmed) {
        pushMessage('writer', '시놉시스를 다시 생성합니다...', 'SYNOPSIS', 'thinking')
        const regenerated = await writerAgent.createSynopsis(topic, research, {
          genre,
          bookContext: buildBookContext(project),
        })
        updateProject((current) => ({
          ...current,
          synopsis: regenerated,
          synopsisConfirmed: true,
        }))
      } else {
        updateProject((current) => ({
          ...current,
          synopsisConfirmed: true,
        }))
      }
    } else {
      updateProject((current) => ({
        ...current,
        synopsisConfirmed: true,
      }))
    }
    pushMessage(
      'writer',
      '시놉시스가 확정되었습니다.',
      'SYNOPSIS',
      'done',
    )

    updateProject((current) => ({
      ...current,
      currentPhase: 'outlining',
    }))
    pushMessage('writer', '작가가 목차를 설계하고 있습니다...', 'OUTLINE', 'thinking')

    const outline = await writerAgent.createOutline(topic, research, synopsis, {
      genre,
      bookContext: buildBookContext(project),
    })

    updateProject((current) => ({
      ...current,
      outline,
    }))

    if (onConfirmationNeeded) {
      const confirmed = await onConfirmationNeeded('outline', outline)
      if (!confirmed) {
        pushMessage('writer', '목차를 다시 설계합니다...', 'OUTLINE', 'thinking')
        const regenerated = await writerAgent.createOutline(topic, research, project.synopsis!, {
          genre,
          bookContext: buildBookContext(project),
        })
        updateProject((current) => ({
          ...current,
          outline: regenerated,
          outlineConfirmed: true,
        }))
      } else {
        updateProject((current) => ({
          ...current,
          outlineConfirmed: true,
        }))
      }
    } else {
      updateProject((current) => ({
        ...current,
        outlineConfirmed: true,
      }))
    }
    pushMessage(
      'writer',
      `${project.outline!.chapters.length}개 챕터로 구성된 목차가 확정되었습니다.`,
      'OUTLINE',
      'done',
    )

    const allChapters: ChapterDraft[] = []
    const allReviews: EditReview[] = []
    const outlineChapters = project.outline!.chapters

    for (const outlineChapter of outlineChapters) {
      const chapterNum = outlineChapter.number
      const chapterTitle = outlineChapter.title

      updateProject((current) => ({
        ...current,
        currentPhase: 'writing',
      }))
      pushMessage('writer', `작가가 ${chapterNum}장 "${chapterTitle}"을 집필하고 있습니다...`, 'WRITE', 'thinking')

      let streamingContent = ''

      let latestChapter: ChapterDraft = await writerAgent.writeChapter({
        topic,
        outline: project.outline!,
        chapterNumber: chapterNum,
        synopsis: project.synopsis!,
        genre,
        bookContext: buildBookContext(project),
        chapterContext: buildChapterContext(project, chapterNum),
        onChunk: (chunk) => {
          streamingContent += chunk
          updateProject((current) => ({
            ...current,
            chapters: [
              ...allChapters,
              {
                chapterNumber: chapterNum,
                title: chapterTitle,
                content: streamingContent,
                wordCount: countWords(streamingContent),
                selfEditLog: [],
                revision: 0,
              },
            ],
          }))
        },
      })

      updateProject((current) => ({
        ...current,
        chapters: [...allChapters, latestChapter],
      }))
      pushMessage(
        'writer',
        `${chapterNum}장 집필 완료. ${latestChapter.wordCount}단어 분량.`,
        'WRITE',
        'done',
      )

      updateProject((current) => ({
        ...current,
        currentPhase: 'editing',
      }))
      pushMessage('editor', `편집자가 ${chapterNum}장을 검수하고 있습니다...`, 'EDIT', 'thinking')

      let latestReview = await editorAgent.reviewChapter(latestChapter, {
        genre,
        bookContext: buildBookContext(project),
      })

      updateProject((current) => ({
        ...current,
        reviews: [...allReviews, latestReview],
      }))
      pushMessage(
        'editor',
        `${chapterNum}장 검수 완료. 판정: ${latestReview.status}`,
        'EDIT',
        latestReview.status === 'MAJOR_REVISION' ? 'error' : 'done',
      )

      let revisionCount = 0

      while (latestReview.status === 'NEEDS_REVISION' && revisionCount < 2) {
        revisionCount += 1
        pushMessage('editor', `${chapterNum}장 ${revisionCount}차 수정 요청...`, 'EDIT', 'thinking')

        streamingContent = ''

        latestChapter = await writerAgent.reviseChapter({
          topic,
          outline: project.outline!,
          chapterNumber: chapterNum,
          synopsis: project.synopsis!,
          genre,
          bookContext: buildBookContext(project),
          chapterContext: buildChapterContext(project, chapterNum),
          editFeedback: latestReview,
          revision: revisionCount,
          onChunk: (chunk) => {
            streamingContent += chunk
            updateProject((current) => ({
              ...current,
              chapters: [
                ...allChapters,
                {
                  chapterNumber: chapterNum,
                  title: chapterTitle,
                  content: streamingContent,
                  wordCount: countWords(streamingContent),
                  selfEditLog: [],
                  revision: revisionCount,
                },
              ],
            }))
          },
        })

        updateProject((current) => ({
          ...current,
          chapters: [...allChapters, latestChapter],
        }))
        pushMessage('writer', `${chapterNum}장 ${revisionCount + 1}차 원고 완료.`, 'WRITE', 'done')

        latestReview = await editorAgent.reviewChapter(latestChapter, {
          genre,
          bookContext: buildBookContext(project),
        })

        updateProject((current) => ({
          ...current,
          reviews: [...allReviews, latestReview],
        }))
        pushMessage('editor', `${chapterNum}장 재검수 결과: ${latestReview.status}`, 'EDIT', latestReview.status === 'MAJOR_REVISION' ? 'error' : 'done')
      }

      allChapters.push(latestChapter)
      allReviews.push(latestReview)

      updateProject((current) => ({
        ...current,
        chapters: allChapters,
        reviews: allReviews,
      }))
    }

    updateProject((current) => ({
      ...current,
      currentPhase: 'publishing',
    }))
    pushMessage(
      'publisher',
      '출판담당이 출판 정보를 준비하고 있습니다...',
      'PUBLISH',
      'thinking',
    )

    const publication = await publisherAgent.preparePublication(
      project.outline!,
      allReviews,
      allChapters,
      {
        genre,
        bookContext: buildBookContext(project),
      },
    )

    updateProject((current) => ({
      ...current,
      publication,
    }))
    pushMessage('publisher', '출판 준비 정보 생성이 완료되었습니다.', 'PUBLISH', 'done')

    updateProject((current) => ({
      ...current,
      currentPhase: 'complete',
    }))
    pushMessage(
      'publisher',
      `파이프라인이 완료되었습니다. 총 ${project.chapters.length}개 챕터와 ${project.reviews.length}개 검수 결과가 준비되었습니다.`,
      'COMPLETE',
      'done',
    )

    return project
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : '파이프라인 실행 중 알 수 없는 오류가 발생했습니다.'

    pushMessage('publisher', message, project.currentPhase.toUpperCase(), 'error')
    updateProject((current) => ({
      ...current,
      currentPhase: 'complete',
    }))

    throw error
  }
}
