"""Карьерные инструменты: резюме, версии, английский, hh.ru, интервью, истории, визитка, письма, отклики, офферы, ИИ-чат.

Каждый сценарий проходит в двух режимах: без ИИ (встроенный анализ по правилам)
и с ИИ (ответы Claude подменяются заранее заданными, чтобы тест был детерминированным).
"""
import pytest

AI_MOCK = r'''window.claude={use:async n=>{await new Promise(r=>setTimeout(r,50));if(n==='sample'){const f=async(input,opts)=>{const t='Совет: откройте **Резюме** и добавьте цифры в опыт.';await new Promise(r=>setTimeout(r,200));opts&&opts.onText&&opts.onText({text:t,delta:t});return {text:t,truncated:false,modelTierApplied:'default'}};
f.json=async(input,opts)=>{await new Promise(r=>setTimeout(r,200));const s=typeof input==='string'?input:'';
if(s.includes('"categories"'))return {score:71,summary:'AI summary',categories:[{name:'Структура',score:90},{name:'Стиль',score:40}],issues:[{severity:'high',title:'Слабый глагол',detail:'d',before:'Помогал участникам с подготовкой',after:'Провёл [число] консультаций'},{severity:'low',title:'Мелочь',detail:'d',before:'нет такой строки',after:'x'}],keywords:{present:['SQL'],missing:['CJM']}};
if(s.includes('"rewrites"'))return {title:'Product Manager Intern',about:'Новый about',skills:['SQL','Excel'],rewrites:[{before:'Отвечал на вопросы в чате курса',after:'Закрыл [число] вопросов'}],changes:['Заголовок','Навыки']};
if(s.includes('Переведи'))return {name:'Alexey Ivanov',title:'PM Intern',about:'Hi',exp:[{role:'r',org:'o',period:'p',bullets:['b']}],projects:[],edu:[{org:'HSE',prog:'BI',period:'2023'}],skills:'SQL, Excel'};
if(s.includes('Разбери текст'))return {title:'Аналитик',exp:[{role:'r',org:'o',period:'p',bullets:['b']}],edu:[],skills:'SQL'};
if(s.includes('Составь 5 вопросов'))return [{q:'Q1?',what:'w',kw:['sql'],model:'m'},{q:'Q2?'},{q:'Q3?'}];
if(s.includes('Оцени ответ'))return {score:7,good:['g'],improve:['i'],better:'b'};
if(s.includes('Расшифруй'))return {summary:'s',must:['m'],nice:[],hidden:['h'],redflags:[],questions:['q1','q2'],prep:['p']};
if(s.includes('STAR'))return {title:'T',s:'s',t:'t',a:'a',r:'r',questions:['q']};
if(s.includes('видеовизитки'))return {score:8,strengths:['s'],improve:['i'],improved:'Улучшенный текст визитки'};
return {}};f.limits=async()=>({maxPromptBytes:65536});return f}
if(n==='downloads')return {save:async()=>({status:'saved'})};return null}};'''


def idle(app, key):
    for _ in range(60):
        st = app.val(f"(UI.tasks['{key}']||{{}}).status")
        if st != "loading":
            return st
        app.page.wait_for_timeout(120)
    return "loading"


@pytest.mark.parametrize("mode", ["local", "ai"])
def test_career_tools(app, mode):
    if mode == "ai":
        app.page.context.add_init_script(AI_MOCK)
    app.open()
    app.page.reload()
    app.page.wait_for_timeout(400)
    app.js("window.__toasts=[];const _t=toast;toast=function(t,i){window.__toasts.push(String(t));return _t(t,i)}")
    assert app.val("aiOn()") is (mode == "ai")
    # резюме
    app.go("resume")
    app.click('[data-act="cvAI"]'); idle(app, "cvAI")
    if app.page.locator('[data-act="cvApply"]').count():
        app.click('[data-act="cvApply"]')
    app.click('[data-act="cvFixAll"]')
    assert app.val("analyzeCv(cv(),cvTargetJob()).score") >= 60
    app.click('[data-act="cvLeft"][data-id="edit"]')
    app.page.fill('[data-cv="about"]', "Студент, провёл 14 интервью и 2 проекта с компаниями.")
    app.page.wait_for_timeout(450)
    assert "14 интервью" in app.val("cv().about")
    app.click('[data-act="cvTpl"][data-id="classic"]')
    app.click('[data-act="cvAdd"][data-id="exp"]'); app.click('[data-act="cvDel"][data-id="exp:0"]')
    app.go("resume-versions"); app.click('[data-act="cvTailor"]'); assert idle(app, "cvTailor") == "done"
    assert app.val("S.cvVersions.length") == 1
    app.click('[data-act="verApply"]', wait=300)
    app.go("resume-english"); app.click('[data-act="cvEnAI"]'); idle(app, "cvEn")
    app.go("resume-hh"); app.click('[data-act="hhSample"]'); app.click('[data-act="hhParse"]'); assert idle(app, "hhParse") == "done"
    app.click('[data-act="hhUse"][data-id="merge"]', wait=300)
    app.go("resume-people"); app.page.fill("#peer-comment", "Добавь цифры в каждый пункт опыта"); app.click('[data-act="peerSend"]')
    assert app.val("S.peerDone") == 1
    # интервью
    app.go("interview"); app.click('[data-act="ivType"][data-id="tech"]'); app.click('[data-act="ivStart"]'); assert idle(app, "ivGen") == "done"
    n = 0
    while app.page.locator("#iv-ans").count() and n < 6:
        app.page.fill("#iv-ans", "Сначала я бы проверил данные, затем сделал group by по городу и в итоге получил результат: выручка выросла на 12%, SQL запрос с order by и limit.")
        app.click('[data-act="ivEval"]'); idle(app, "ivEval"); app.click('[data-act="ivNext"]'); n += 1
    assert app.val("S.interviews.length") == 1
    app.go("interview-decode"); app.click('[data-act="decRun"]'); assert idle(app, "decode") == "done"
    app.go("interview-star"); app.click('[data-act="starGen"]'); idle(app, "star"); assert app.val("S.stories.length") == 1
    app.go("interview-pitch"); app.click('[data-act="pitchRun"]'); idle(app, "pitch"); app.click('[data-act="pitchUse"]')
    app.go("interview-letters"); app.click('[data-act="letRun"]'); assert idle(app, "letter") == "done"
    # отклики и офферы
    app.go("applications"); app.click('[data-act="appMove"][data-id="a2:1"]')
    app.page.drag_and_drop('[data-app="a1"]', '.kb-col[data-col="interview"]'); app.page.wait_for_timeout(200)
    assert app.val("S.apps.a1") == "interview"
    app.go("applications-offers"); app.page.select_option('[data-off="o1:money"]', "9"); app.page.wait_for_timeout(200)
    app.click('[data-act="offAdv"]'); idle(app, "offAdv")
    app.click('[data-act="offAdd"]'); app.page.fill("#of-co", "Avito"); app.page.fill("#of-title", "Стажёр"); app.click("#offForm button[type=submit]")
    assert app.val("offers().length") == 4
    app.go("applications-salary"); app.page.select_option("#sal-prof", "Data Analyst"); app.page.wait_for_timeout(200)
    # ИИ-помощник
    app.go("dashboard"); app.click('[data-act="ai"]'); app.page.fill("#aiInput", "Что улучшить в резюме?"); app.page.press("#aiInput", "Enter")
    app.page.wait_for_timeout(1200)
    assert app.val("UI.aiLog.filter(m=>!m.me&&!m.typing).length") >= 2
