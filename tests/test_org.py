"""Кабинеты работодателя и вуза: отклики, воронка найма, проекты, рейтинг, студенты, партнёры, рассылки."""
from conftest import STUB


def test_application_reject_with_reason_reaches_student(app):
    app.open()
    app.js("S.applied.j9=1;save()")  # Алексей откликнулся на Product Intern в SkillUp
    app.js("switchRole('employer','empvac-0')")
    app.page.wait_for_timeout(300)
    assert "Алексей Иванов" in app.page.inner_text("#view")
    app.click('[data-act="appReject"][data-id="su:0:c2"]')
    app.page.select_option("#rj-reason", index=0)
    app.page.fill("#rj-note", "Подтвердите SQL проектом и откликайтесь снова.")
    app.click('#rejForm button[type="submit"]')
    assert app.val("S.appSt['su:0:c2'].st") == "rejected"
    assert app.val("S.apps['ap-j9']") == "rejected"
    # студент видит ответ с причиной в уведомлениях и в чате
    assert app.val("notifs().some(n=>n.s.startsWith('Причина'))")
    assert "Причина" in app.val("S.chats['inv-p1'].msgs.map(m=>m.t).join(' ')")


def test_application_invite_marks_answered(app):
    app.open(role="employer")
    app.go("empvac-0", wait=300)
    before = app.val("vacApps(emp(),vacList()[0]).filter(a=>a.st==='new').length")
    key = app.val("vacApps(emp(),vacList()[0])[0].key")
    app.click(f'[data-act="appInvite"][data-id="{key}"]')
    app.click('#inviteForm button[type="submit"]', wait=300)
    assert app.val(f"S.appSt['{key}'].st") == "invited"
    assert app.val("vacApps(emp(),vacList()[0]).filter(a=>a.st==='new').length") == before - 1
    # приглашённый появился в воронке найма
    cid = key.split(":")[2]
    assert app.val(f"pipeOf().find(x=>x.cid==='{cid}').st") == "invited"


def test_vacancy_autocloses_after_seven_days_and_reopens(app):
    app.open(role="employer")
    app.js("S.t0=Date.now()-3*864e5;save()")  # прошло три дня: самый старый отклик ждёт 9 дней
    app.go("empvac-0", wait=300)
    assert app.val("vacState(emp(),vacList()[0])") == "auto"
    assert "закрыта автоматически" in app.page.inner_text("#view").lower()
    for _ in range(6):
        loc = app.page.locator('[data-act="appReject"]')
        if not loc.count():
            break
        loc.first.click()
        app.page.wait_for_timeout(150)
        app.click('#rejForm button[type="submit"]')
    assert app.val("vacState(emp(),vacList()[0])") == "open"
    # ручное закрытие и открытие
    app.click('[data-act="vacToggle"]')
    assert app.val("vacState(emp(),vacList()[0])") == "closed"
    app.click('[data-act="vacToggle"]')
    assert app.val("vacState(emp(),vacList()[0])") == "open"


def test_hiring_pipeline_full_path(app):
    app.open(role="employer")
    app.go("hiring", wait=300)
    app.click('.kan [data-act="invite"][data-id="c3"]')
    app.click('#inviteForm button[type="submit"]', wait=300)
    app.go("hiring", wait=300)
    assert app.val("pipeOf().find(x=>x.cid==='c3').st") == "invited"
    app.click('[data-act="pipeSlot"][data-id="c3"]')
    app.click('#slotForm button[type="submit"]')
    assert app.val("pipeOf().find(x=>x.cid==='c3').st") == "interview"
    app.click('[data-act="pipeOffer"][data-id="c3"]')
    app.page.fill("#of-sal", "70 000 ₽")
    app.click('#offerForm button[type="submit"]')
    assert app.val("pipeOf().find(x=>x.cid==='c3').offer.sal") == "70 000 ₽"
    app.click('[data-act="pipeHired"][data-id="c3"]')
    app.click('[data-act="pipeHiredOk"]')
    assert app.val("pipeOf().find(x=>x.cid==='c3').st") == "hired"
    # найм учтён в рейтинге компании
    assert app.val("coStats(emp()).hires") == 3
    # отказ и возврат в работу
    app.click('[data-act="pipeReject"][data-id="c6"]')
    app.click('#rejForm button[type="submit"]')
    assert app.val("pipeOf().find(x=>x.cid==='c6').st") == "rejected"
    app.click('[data-act="pipeBack"][data-id="c6"]')
    assert app.val("pipeOf().find(x=>x.cid==='c6').st") == "new"
    assert not [t for t in app.toasts() if STUB.search(t)]


def test_offer_to_student_shows_in_notifications(app):
    app.open()
    app.js("finishProject('p1','4,8','Отличная работа по воронке, выводы подтверждены данными.')")
    app.js("switchRole('employer','hiring')")
    app.page.wait_for_timeout(300)
    assert app.val("pipeOf().find(x=>x.cid==='c2').st") == "invited"
    app.js("S.inv.p1.st='accepted';S.inv.p1.slot=SLOTS[0];save();render()")
    app.click('[data-act="pipeOffer"][data-id="c2"]')
    app.click('#offerForm button[type="submit"]')
    assert app.val("notifs().some(n=>n.t.includes('оффер'))")
    assert app.val("S.chats['inv-p1'].unreadS") >= 1


def test_project_solutions_favourites_compare_and_close(app):
    app.open(role="employer")
    app.go("empproject-p1", wait=300)
    app.click('[data-act="favToggle"][data-id="p1:c6"]')
    assert app.val("S.fav['p1:c6']") == 1
    assert app.val("projSolutions(emp(),P('p1'))[0].cid") == "c6"  # избранное наверху
    app.page.check('[data-cmp="c6"]')
    app.page.wait_for_timeout(150)
    app.page.check('[data-cmp="c3"]')
    app.page.wait_for_timeout(150)
    app.click('[data-act="cmpOpen"]')
    text = app.page.inner_text("#modalRoot")
    assert "тимур ахметов" in text.lower() and "екатерина волкова" in text.lower() and "Итоговая оценка" in text
    app.close_modal()
    app.click('[data-act="projToggle"]')
    assert app.val("!!S.closedProj.p1")
    # студент не может вступить в закрытый проект
    app.js("switchRole('student','project-p1')")
    app.page.wait_for_timeout(300)
    assert "Приём решений закрыт" in app.page.inner_text("#view")
    assert app.page.locator('#view aside [data-act="join"]').count() == 0


def test_company_page_and_student_review(app):
    app.open()
    app.go("company-su", wait=300)
    assert app.page.locator('[data-act="coReview"]').count() == 0  # отзыв только после проекта
    app.js("finishProject('p1','4,8','Отличная работа по воронке, выводы подтверждены данными.');render()")
    before = app.val("coStats(EMPLOYERS.su).n")
    app.click('[data-act="coReview"]')
    app.page.select_option("#cr-stars", "4")
    app.page.fill("#cr-text", "Настоящая задача, подробный отзыв ментора и ответ за два дня.")
    app.click('#coRevForm button[type="submit"]')
    assert app.val("coStats(EMPLOYERS.su).n") == before + 1
    assert "ваш отзыв" in app.page.inner_text("#view").lower()
    # со страницы проекта есть переход к рейтингу
    app.go("project-p1", wait=300)
    assert app.page.locator('[data-go="company-su"]').count() == 1


def test_university_request_goes_to_employer_and_back(app):
    app.open(role="uni")
    app.go("unipartners", wait=300)
    app.click('[data-act="uniReqNew"][data-id="SkillUp"]')
    app.click('#uniReqForm button[type="submit"]')
    assert app.val("S.uniReq[0].st") == "sent"
    app.js("switchRole('employer','empjobs')")
    app.page.wait_for_timeout(300)
    assert "Запросы вузов" in app.page.inner_text("#view")
    app.click('[data-act="reqAccept"]', wait=400)
    assert app.val("S.uniReq[0].st") == "accepted"
    assert "Проект под курс" in app.page.input_value("#pp-title")
    app.js("switchRole('uni','unipartners')")
    app.page.wait_for_timeout(300)
    assert "Компания готовит проект" in app.page.inner_text("#view")


def test_university_students_filters_card_export_and_mailing(app):
    app.open(role="uni")
    app.go("unistudents", wait=300)
    total = app.val("uniFiltered().length")
    app.page.select_option("#us-year", "4 курс")
    app.page.wait_for_timeout(150)
    assert 0 < app.val("uniFiltered().length") < total
    assert app.val("uniFiltered().every(r=>r.prog.includes('4 курс'))")
    app.page.select_option("#us-year", "")
    app.click('[data-act="uniStudent"][data-id="Дарья Федорова"]')
    assert "не хватает для цели" in app.page.inner_text("#modalRoot").lower()
    app.close_modal()
    with app.page.expect_download() as dl:
        app.click('[data-act="uniExport"]')
    assert dl.value.suggested_filename.endswith(".csv")
    # рассылка выбранным студентам, включая Алексея
    app.page.check('[data-usel="Алексей Иванов"]')
    app.page.wait_for_timeout(150)
    app.page.check('[data-usel="Глеб Андреев"]')
    app.page.wait_for_timeout(150)
    app.click('.page-h [data-act="uniMailNew"]')
    app.page.select_option("#um-target", "project:p6")
    app.click('#uniMailForm button[type="submit"]', wait=300)
    assert app.val("location.hash") == "#unimail"
    assert app.val("S.uniMail[0].names.length") == 2
    # студент получает уведомление и, начав проект, отмечается как откликнувшийся
    assert app.val("notifs().some(n=>n.t.includes('Центр карьеры'))")
    assert app.val("mailStatus(S.uniMail[0],uniRows()[0],0)[1]") == "Получил"
    app.js("S.pstat.p6='active';save()")
    assert app.val("mailStatus(S.uniMail[0],uniRows()[0],0)[1]") == "Начал проект"


def test_program_page_integrates_project_into_course(app):
    app.open(role="uni")
    app.go("uni", wait=300)
    app.click('[data-go="uniprogram-0"]', wait=300)
    assert "Бизнес-информатика" in app.page.inner_text("#view")
    app.click('[data-act="uniIntegrateP"]')
    pid = app.page.input_value("#uf-proj")
    app.click('#uniForm button[type="submit"]')
    assert app.val("S.uniCourses[0].pid") == pid
    assert "Уже в курсе" in app.page.inner_text("#view")
