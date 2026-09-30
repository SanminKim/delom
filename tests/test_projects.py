"""Полный цикл каждого проекта: участие → задачи → решение → проверка ментора → навыки → портфолио → приглашение."""
import pytest

PROJECT_IDS = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10", "p11"]
SUMMARY = ("Нашёл три проблемных этапа и проверил гипотезы на данных компании. "
           "Предложил решение с измеримым эффектом и описал, как проверить его экспериментом. ") * 2


def join_project(app, pid):
    app.go(f"project-{pid}")
    app.click('#view aside [data-act="join"]')
    if app.val(f"P('{pid}').format") == "Командный":
        app.click('.team-opt')
        app.click('[data-act="teamJoin"]')
    else:
        app.click('[data-act="confirmJoin"]')
    assert app.val("location.hash") == f"#workspace-{pid}"
    assert app.val(f"pst('{pid}')") == "active"


def fill_workspace(app, pid, upload=True):
    for _ in range(4):
        loc = app.page.locator('.task:not(.done) [data-act="tick"]')
        if loc.count() == 0:
            break
        loc.first.click()
        app.page.wait_for_timeout(120)
    assert app.val(f"wsOf('{pid}').tasks.every(Boolean)")
    app.page.fill("#ws-sum", SUMMARY)
    if upload:
        app.page.set_input_files("#upl", files=[{"name": "решение.pdf", "mimeType": "application/pdf",
                                                 "buffer": b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF"}])
        app.page.wait_for_timeout(400)
        assert app.val(f"wsOf('{pid}').file") == "решение.pdf"
        assert app.page.locator("#wsSubmit").is_enabled()
    else:
        assert not app.page.locator("#wsSubmit").is_enabled()


def submit(app, pid):
    app.click('#wsSubmit')
    assert app.val(f"pst('{pid}')") == "review"
    app.close_modal()


def mentor_finish(app, pid):
    app.js(f"switchRole('mentor','review-{pid}')")
    app.page.wait_for_timeout(250)
    assert app.page.locator('[data-act="finishReview"]').count() == 1
    app.click('[data-act="finishReview"]', wait=300)
    assert app.val(f"pst('{pid}')") == "done"
    app.close_modal()


@pytest.mark.parametrize("pid", PROJECT_IDS)
def test_project_full_cycle(app, pid):
    app.open()
    join_project(app, pid)
    fill_workspace(app, pid)
    submit(app, pid)
    mentor_finish(app, pid)
    # все навыки проекта подтверждены именно этим проектом
    assert app.val(f"confirmsOf('{pid}').every(id=>sk(id).st==='ok')")
    assert app.val(f"confirmsOf('{pid}').some(id=>sk(id).pid==='{pid}'||sk(id).baseOk)")
    # страница результата и портфолио
    app.js(f"switchRole('student','complete-{pid}')")
    app.page.wait_for_timeout(250)
    assert app.page.locator(".celebrate").count() == 1
    app.click('[data-act="addPortfolio"]')
    assert app.val(f"!!S.portfolio['{pid}']")
    app.go("portfolio")
    title = app.val(f"P('{pid}').title")
    assert title in app.page.inner_text("#view")
    # приглашение — только если компания нанимает
    if app.val(f"!!P('{pid}').hiring"):
        assert app.val(f"!!S.inv['{pid}']")
        app.go(f"complete-{pid}")
        app.click('[data-act="acceptInvite"]')
        app.click('[data-act="confirmSlot"]')
        assert app.val(f"S.inv['{pid}'].st") == "accepted"
        assert app.val(f"S.chats['inv-{pid}'].msgs.length") >= 4
    else:
        assert not app.val(f"!!S.inv['{pid}']")


def test_return_for_rework_and_resubmit(app):
    app.open()
    join_project(app, "p6")
    fill_workspace(app, "p6")
    submit(app, "p6")
    app.js("switchRole('mentor','review-p6')")
    app.page.wait_for_timeout(250)
    app.page.fill("#rv-return", "Добавьте расчёт мощности теста и проверку равенства групп.")
    app.click('[data-act="returnReview"]')
    assert app.val("pst('p6')") == "active"
    assert app.val("wsOf('p6').attempt") == 2
    app.close_modal()
    app.js("switchRole('student','workspace-p6')")
    app.page.wait_for_timeout(250)
    assert "вернул решение на доработку" in app.page.inner_text("#view")
    submit(app, "p6")
    mentor_finish(app, "p6")
    assert app.val("S.reviews.p6.comment.length") > 20


def test_withdraw_and_generated_report(app):
    app.open()
    join_project(app, "p10")
    fill_workspace(app, "p10", upload=False)
    app.click('[data-act="demoFile"]', wait=400)
    assert app.val("wsOf('p10').fileDemo") is True
    assert app.page.locator("#wsSubmit").is_enabled()
    app.click('[data-act="openStored"]', wait=400)
    assert app.modal_open()
    app.close_modal()
    submit(app, "p10")
    app.click('[data-act="withdraw"]')
    assert app.val("pst('p10')") == "active"


def test_own_team(app):
    app.open()
    app.go("project-p5")
    app.click('#view aside [data-act="join"]')
    app.click('[data-act="teamOwn"]')
    app.page.fill("#team-name", "Growth Squad")
    app.click('[data-act="teamJoin"]')
    assert app.val("S.teams.p5.own") is True
    assert app.val("pst('p5')") == "active"
    app.go("messages-team-p5")
    assert "Команда создана" in app.page.inner_text("#view")


def test_published_project_is_completable(app):
    app.open(role="employer")
    app.go("postproject")
    app.click('[data-act="ppDemo"]')
    app.click('#projForm button[type="submit"]', wait=300)
    pid = app.val("allProjects()[0].id")
    assert pid.startswith("n")
    app.js("switchRole('student')")
    join_project(app, pid)
    fill_workspace(app, pid)
    submit(app, pid)
    mentor_finish(app, pid)
    assert app.val(f"confirmsOf('{pid}').every(id=>sk(id).st==='ok')")
