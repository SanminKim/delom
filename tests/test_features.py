"""Сценарии кабинетов: профиль, резюме, ментор, курсы, работодатель, вуз, видео, треки."""
import pathlib, re

LIBS = pathlib.Path("/tmp/claude-0/-home-claude-delom/ab3e5f9c-6496-50d6-835a-3c90ce3af6c9/scratchpad/libs/node_modules")


def local_cdn(app):
    """Если библиотеки есть локально — отдаём их вместо CDN (в CI идём в сеть)."""
    if not LIBS.exists():
        return
    def handle(route):
        url = route.request.url
        m = re.search(r"/npm/([^@/]+)@[^/]+/(.+)$", url)
        f = LIBS / m.group(1) / m.group(2) if m else None
        if f and f.exists():
            route.fulfill(path=str(f), content_type="application/javascript")
        else:
            route.abort()
    app.page.context.route(re.compile(r"cdn\.jsdelivr\.net/npm/"), handle)


def test_onboarding_reads_real_resume(app):
    app.open(onboarded=False)
    app.go("dashboard", wait=400)
    assert app.modal_open(), app.val("[location.hash,S.onboarded,S.authed,curRole,document.querySelector('#modalRoot').innerHTML.length]")
    text = "Иван Петров. Навыки: SQL, Python, Figma, A/B-тесты, когортный анализ, BPMN. Делал дашборд в DataLens."
    app.page.set_input_files("#resumeFile", files=[{"name": "cv.txt", "mimeType": "text/plain", "buffer": text.encode()}])
    app.page.wait_for_timeout(1600)
    found = app.val("UI.onb.found.map(id=>SK[id].name)")
    for need in ["SQL", "Python", "Figma", "A/B-тестирование", "Когортный анализ", "BPMN", "BI-дашборды (DataLens)"]:
        assert need in found, (need, found)
    app.click('[data-act="onbSk"]')  # снять один навык
    app.page.select_option("#onb-add", "ux")
    app.page.wait_for_timeout(150)
    app.click('[data-act="onbSkillsOk"]')
    assert "ux" in app.val("S.resumeSkills")
    assert app.val("sk('ux').st") == "self"
    app.click('[data-act="startGoal"]')
    assert app.val("S.onboarded") is True
    app.go("profile")
    app.click('[data-act="openStored"][data-id="resume"]', wait=400)
    assert "SQL" in app.page.inner_text("#modalRoot")


def test_onboarding_reads_pdf(app):
    local_cdn(app)
    app.open(onboarded=False)
    app.go("dashboard", wait=400)
    pdf = (b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
           b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 100]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n"
           b"4 0 obj<</Length 44>>stream\nBT /F1 12 Tf 10 50 Td (SQL Python Figma) Tj ET\nendstream endobj\n"
           b"5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF")
    app.page.set_input_files("#resumeFile", files=[{"name": "cv.pdf", "mimeType": "application/pdf", "buffer": pdf}])
    app.page.wait_for_function("UI.onb&&UI.onb.step==='skills'", timeout=15000)
    found = app.val("UI.onb.found.map(id=>SK[id].name)")
    assert {"SQL", "Python", "Figma"} <= set(found), found


def test_profile_visibility_and_public_page(app):
    app.open()
    app.go("profile")
    app.page.fill("#pr-city", "Казань")
    app.page.fill("#pr-about", "Люблю продуктовую аналитику и эксперименты.")
    app.click('#profileForm button[type="submit"]')
    assert app.val("S.profile.city") == "Казань"
    app.go("u")
    body = app.page.inner_text("#view")
    assert "Казань" in body and "Люблю продуктовую аналитику" in body
    # скрыть профиль → пропадает из поиска и публичной страницы
    app.go("profile")
    app.page.uncheck("#pr-vis")
    app.page.wait_for_timeout(200)
    assert app.val("VIS().show") is False
    app.go("u")
    assert "Профиль скрыт" in app.page.inner_text("#view")
    app.js("switchRole('employer','candidates')")
    app.page.wait_for_timeout(300)
    assert "Алексей Иванов" not in app.page.inner_text("#candList")
    # публичная страница открывается и без входа
    app.js("switchRole('student','profile')")
    app.page.wait_for_timeout(200)
    app.page.check("#pr-vis")
    app.page.wait_for_timeout(200)
    app.js("S.authed=false;save()")
    app.go("u")
    assert "Алексей Иванов" in app.page.inner_text("#view") and "Создать свой профиль" in app.page.inner_text("#view")


def test_mentor_consultation_confirms_skill(app):
    app.open()
    assert app.val("sk('ab').st") != "ok"
    app.js("howConfirm('ab')")
    app.page.wait_for_timeout(150)
    app.click('[data-act="mentorBook"]')
    app.click('[data-act="mbPick"]')
    app.click('[data-act="mbSlot"]')
    app.click('[data-act="mbConfirm"]')
    app.js("switchRole('mentor');UI.mentorTab='cons';render()")
    app.page.wait_for_timeout(200)
    app.click('[data-act="mentorCons"][data-id="s-ab"]')
    app.click('[data-act="consAssess"][data-id="ab"]')
    app.click('[data-act="caStar"][data-id="5"]')
    app.page.fill("#ca-comment", "Уверенно рассчитал выборку и разобрал ошибки подглядывания.")
    app.click('[data-act="caSave"]')
    assert app.val("sk('ab').st") == "ok"
    assert app.val("sk('ab').via") == "mentor"


def test_course_final_confirms_skill(app):
    app.open()
    app.js("courseModal('ue')")
    app.page.wait_for_timeout(150)
    app.click('[data-act="enroll"]')
    app.click('[data-act="courseFinal"]')
    app.page.fill("#cf-ans", "Ситуация: в учебном проекте сервиса доставки заказ приносил убыток. Задача — посчитать юнит-экономику "
                  "и найти рычаги. Сначала я посчитал выручку и затраты на заказ, затем разложил маржу по статьям в Excel: "
                  "себестоимость, курьер, упаковка, CAC. В итоге нашёл два рычага — средний чек и объединение доставок, "
                  "результат: маржа выросла с −33 до +41 рубля на заказ, это проверили на данных за месяц.")
    app.click('[data-act="courseSubmit"]')
    assert app.val("sk('ue').st") == "ok", app.page.inner_text("#modalRoot")
    assert app.val("sk('ue').via") == "course"


def test_cv_review_by_mentor(app):
    app.open()
    app.go("resume-people")
    app.click('[data-act="hrOrder"]')
    assert app.val("S.hrReview.st") == "pending"
    app.js("switchRole('mentor');UI.mentorTab='cons';render()")
    app.page.wait_for_timeout(200)
    app.click('[data-act="hrWrite"]', wait=300)
    app.click('[data-act="hrSend"]')
    assert app.val("S.hrReview.st") == "done"
    app.js("switchRole('student','resume-people')")
    app.page.wait_for_timeout(250)
    assert "Готово" in app.page.inner_text("#view")


def test_employer_invites_candidate_and_gets_reply(app):
    app.open(role="employer")
    app.go("candidates", wait=300)
    app.click('#candList [data-act="invite"][data-id="c3"]')
    app.click('#inviteForm button[type="submit"]', wait=300)
    cid = "cand-su-c3"
    assert app.val(f"!!S.chats['{cid}']")
    app.page.wait_for_timeout(1900)
    assert app.val(f"S.chats['{cid}'].msgs.length") >= 3
    assert "Екатерина Волкова" in app.page.inner_text("#view")
    # в сообщениях студента чужой диалог не появляется
    assert not app.val(f"chatView('','student').includes('{cid}')")


def test_tariff_change_and_enterprise_request(app):
    app.open(role="employer")
    app.go("pricing")
    app.click('[data-act="tier"][data-id="Старт"]')
    app.click('[data-act="tierConfirm"]')
    assert app.val("S.tierNext.name") == "Старт"
    app.click('[data-act="tierCancel"]')
    assert app.val("S.tierNext") is None
    app.click('[data-act="tier"][data-id="Корпоративный"]')
    app.page.fill("#sf-contact", "hr@skillup.example")
    app.click('#salesForm button[type="submit"]')
    assert app.val("S.salesReq.length") == 1
    assert "Запрос №101" in app.page.inner_text("#view")


def test_university_report_and_course(app):
    app.open(role="uni")
    app.go("uni")
    app.click('[data-act="uniReport"]', wait=300)
    assert app.modal_open()
    app.close_modal()
    app.click('[data-act="uniIntegrate"]')
    app.click('#uniForm button[type="submit"]')
    assert app.val("S.uniCourses[0].pid") == "p4"
    app.js("switchRole('student','project-p4')")
    app.page.wait_for_timeout(250)
    assert "Входит в курс" in app.page.inner_text("#view")


def test_pitch_video_and_track_waitlist(app):
    app.open()
    app.go("interview-pitch")
    app.page.set_input_files("#pitch-video", files=[{"name": "визитка.webm", "mimeType": "video/webm", "buffer": b"\x1aE\xdf\xa3" + b"0" * 64}])
    app.page.wait_for_timeout(400)
    assert app.val("S.pitchVideo.name") == "визитка.webm"
    app.click('[data-act="openStored"][data-id="pitch"]', wait=300)
    assert app.page.locator("#modalRoot video").count() == 1
    app.close_modal()
    app.js("A.changeGoal()")
    app.page.wait_for_timeout(150)
    app.click('[data-act="soonGoal"][data-id="UX/UI Designer"]')
    assert app.val("S.waitlist['UX/UI Designer']") is True
