"""Обход всего продукта: каждый экран каждой роли и каждая кнопка на нём.

Для каждой кнопки состояние приложения восстанавливается из одного и того же
«богатого» снимка, открывается экран, нажимается кнопка (и главная кнопка
открывшегося окна). Тест падает при любой ошибке JavaScript или при уведомлении-заглушке.
"""
import pytest
from conftest import URL, STUB

RICH_STATE = """
S.authed=true;S.onboarded=true;S.resume=true;S.resumeSkills=['sql','py'];S.resumeFile={name:'Иванов_резюме.txt',size:420,demo:1};
S.pstat.p6='active';Object.assign(wsOf('p6'),{tasks:[1,1,1,1],summary:'x'.repeat(200),file:'a.pdf'});S.pstat.p6='review';
S.pstat.p2='active';wsOf('p2');
S.teams.p5={name:'Growth Team',role:'Аналитик',members:[['Екатерина Волкова','ЕВ','#C2410C','Product Manager']]};S.pstat.p5='active';wsOf('p5');ensureTeamChat('p5');
finishProject('p1','4,8','Отличная работа по воронке, выводы подтверждены данными.');S.portfolio.p1=true;
S.mentorReq.sql={m:'m2',slot:MSLOTS[0]};S.courses.pa={i:0};
S.hrReview={who:'m1',st:'pending',date:todayStr()};S.applied.j1=1;S.applied.j9=1;
S.pipe.su={c3:{st:'interview',slot:SLOTS[0],prev:'invited'},c6:{st:'offer',offer:{sal:'60 000 ₽',start:'1 ноября',note:''},prev:'interview'},c4:{st:'rejected',reason:REASONS[0],at:todayStr(),prev:'new'}};
S.appSt['su:0:c1']={st:'rejected',reason:REASONS[1],at:todayStr()};S.fav['p1:c3']=1;
S.uniReq=[{id:1,co:'SkillUp',course:'Анализ данных',skill:'SQL',n:40,note:'к началу ноября',date:todayStr(),st:'sent'}];
S.uniMail=[{id:7,aud:'Бизнес-информатика',names:[],target:{kind:'project',id:'p4'},msg:'Центр карьеры рекомендует проект.',date:todayStr()}];
S.coReviews=[{co:'su',stars:5,text:'Настоящая задача и быстрый ответ.',role:'участник проекта',date:todayStr()}];
save();
"""

ROUTES = {
    "student": ["dashboard", "career", "skills", "projects", "project-p1", "project-p5", "project-p8", "workspace-p2",
                "workspace-p5", "workspace-p6", "complete-p1", "internships", "vacancies", "job-j1", "job-j6", "portfolio",
                "profile", "try", "messages", "messages-inv-p1", "resume", "resume-versions", "resume-recruiter",
                "resume-english", "resume-hh", "resume-people", "interview", "interview-decode", "interview-star",
                "interview-pitch", "interview-letters", "applications", "applications-offers", "applications-salary", "u", "company-su"],
    "employer": ["empdash", "candidates", "empjobs", "postproject", "pricing", "empmessages", "hiring", "empvac-0", "empvac-1",
                 "empproject-p1", "company-su"],
    "mentor": ["mentor", "review-p6", "review-p1"],
    "uni": ["uni", "unistudents", "uniprogram-0", "unipartners", "unimail"],
    "public": ["welcome", "auth-student", "auth-employer", "metrics"],
}
ALL = [(role, r) for role, rs in ROUTES.items() for r in rs]


def snapshot(app):
    app.open()
    app.js(RICH_STATE)
    return app.val("localStorage.getItem(KEY)")


def load(app, snap, role, route):
    app.page.evaluate("([k,v])=>localStorage.setItem(k,v)", ["delom-demo-v2", snap])
    if role == "public" and route != "metrics":
        app.page.evaluate("()=>{const s=JSON.parse(localStorage.getItem('delom-demo-v2'));s.authed=false;localStorage.setItem('delom-demo-v2',JSON.stringify(s))}")
    if role not in ("student", "public"):
        app.page.evaluate(f"()=>{{const s=JSON.parse(localStorage.getItem('delom-demo-v2'));s.lastRole='{role}';localStorage.setItem('delom-demo-v2',JSON.stringify(s))}}")
    app.page.goto(URL + "#" + route)
    app.page.reload()
    app.page.wait_for_timeout(250)
    app.js("window.__toasts=[];const _t=toast;toast=function(t,i){window.__toasts.push(String(t));return _t(t,i)}")


@pytest.mark.parametrize("role,route", ALL, ids=[f"{r}:{x}" for r, x in ALL])
def test_screen_renders_cleanly(app, role, route):
    snap = snapshot(app)
    load(app, snap, role, route)
    text = app.page.inner_text("body")
    assert "undefined" not in text and "NaN" not in text and "[object" not in text, text[:400]
    assert not STUB.search(text), STUB.search(text).group(0)
    # все переходы ведут на существующие экраны
    bad = app.val("[...document.querySelectorAll('[data-go]')].map(e=>e.dataset.go.split('-')[0]).filter(n=>!VIEWS[n]&&n!=='onb')")
    assert not bad, bad
    # у каждого действия есть обработчик
    missing = app.val("[...new Set([...document.querySelectorAll('[data-act]')].map(e=>e.dataset.act))].filter(a=>typeof A[a]!=='function')")
    assert not missing, missing


@pytest.mark.parametrize("role,route", ALL, ids=[f"{r}:{x}" for r, x in ALL])
def test_every_button_works(app, role, route):
    snap = snapshot(app)
    load(app, snap, role, route)
    n = app.val("document.querySelectorAll('#view [data-act]:not([disabled]), #tabbar [data-act]').length")
    for i in range(n):
        load(app, snap, role, route)
        loc = app.page.locator("#view [data-act]:not([disabled]), #tabbar [data-act]").nth(i)
        if not loc.count() or not loc.is_visible():
            continue
        act = loc.get_attribute("data-act")
        if act in ("drawer",):
            continue
        loc.click(timeout=3000)
        app.page.wait_for_timeout(250)
        # если открылось окно — нажимаем его главную кнопку
        prim = app.page.locator("#modalRoot .btn-p:not([disabled])")
        if prim.count() and prim.first.is_visible():
            try:
                prim.first.click(timeout=2000)
                app.page.wait_for_timeout(250)
            except Exception:
                pass
        assert not app.errors, f"{route}: кнопка «{act}» → {app.errors}"
        stubs = [t for t in app.toasts() if STUB.search(t)]
        assert not stubs, f"{route}: кнопка «{act}» показывает заглушку {stubs}"


@pytest.mark.parametrize("role,route", ALL, ids=[f"{r}:{x}" for r, x in ALL])
def test_phone_layout(phone, role, route):
    snap = snapshot(phone)
    load(phone, snap, role, route)
    assert phone.val("document.documentElement.scrollWidth") <= 360
    # ничего не обрезано краем экрана: элемент либо помещается, либо лежит в прокручиваемой ленте
    clipped = phone.val("""(()=>{const W=360;  // не innerWidth: при переполнении браузер расширяет область просмотра

      const scrolls=e=>{for(let p=e.parentElement;p;p=p.parentElement){const s=getComputedStyle(p);if(/(auto|scroll)/.test(s.overflowX)&&p.scrollWidth>p.clientWidth+2)return true}return false};
      return [...document.querySelectorAll('#view *')].filter(e=>{if(e.children.length||e.closest('.mq,[aria-hidden=true]'))return false;const r=e.getBoundingClientRect();
        return r.width>2&&r.height>2&&(r.right>W+1||r.left<-1)&&!scrolls(e)&&!e.closest('svg')}).slice(0,5).map(e=>e.tagName+'.'+String(e.className.baseVal??e.className).slice(0,30)+' «'+(e.innerText||'').trim().slice(0,30)+'»')})()""")
    assert not clipped, clipped
    # таблицы на телефоне превращаются в карточки и не требуют прокрутки вбок
    wide = phone.val("[...document.querySelectorAll('#view table.tbl:not(.tbl-x)')].filter(t=>t.getBoundingClientRect().width>360).length")
    assert wide == 0
