"""Общие настройки автотестов «Делом».

Приложение — один файл index.html без сервера, поэтому тесты открывают его
напрямую из репозитория в Chromium (Playwright) и проверяют сценарии
через интерфейс и через состояние приложения (объект S).
"""
import pathlib, re
import pytest
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "index.html").as_uri()

# Фразы, которые выдают заглушку вместо реальной функции
STUB = re.compile(r"в реальном сервисе|появится в (ближайшем|следующей)|в демо полностью|режиме предпросмотра|менеджер свяжется|отправлен на почту", re.I)


# Анимации переходов между экранами (View Transitions) выполняются асинхронно;
# в тестах отключаем их, чтобы экран отрисовывался сразу и проверки были детерминированными.
NO_VT = "delete Document.prototype.startViewTransition; document.startViewTransition = undefined;"


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch()
        yield b
        b.close()


class App:
    """Обёртка над страницей: переходы, состояние, ошибки, уведомления."""

    def __init__(self, page):
        self.page = page
        self.errors = []
        page.on("pageerror", lambda e: self.errors.append(str(e)))

    def open(self, authed=True, onboarded=True, role="student"):
        self.page.goto(URL + "#welcome")
        self.page.evaluate("localStorage.clear()")
        self.page.reload()
        self.page.wait_for_timeout(150)
        if authed:
            self.js(f"S.authed=true;S.onboarded={str(onboarded).lower()};S.lastRole='{role}';save()")
        # запоминаем все уведомления, чтобы ловить заглушки
        self.js("window.__toasts=[];const _t=toast;toast=function(t,i){window.__toasts.push(String(t));return _t(t,i)}")
        return self

    def js(self, code):
        return self.page.evaluate(code if code.strip().startswith(("(", "()")) else f"(()=>{{{code}}})()")

    def val(self, expr):
        return self.page.evaluate(expr)

    def go(self, route, wait=200):
        self.page.evaluate(f"location.hash={route!r}")
        self.page.wait_for_timeout(wait)

    def click(self, selector, wait=200):
        self.page.locator(selector).first.click()
        self.page.wait_for_timeout(wait)

    def toasts(self):
        return self.val("window.__toasts||[]")

    def modal_open(self):
        return self.val("!!document.querySelector('#modalRoot .modal')")

    def close_modal(self):
        self.js("closeModal()")

    def check(self):
        assert not self.errors, f"Ошибки JavaScript: {self.errors}"
        stubs = [t for t in self.toasts() if STUB.search(t)]
        assert not stubs, f"Уведомления-заглушки: {stubs}"


@pytest.fixture
def app(browser):
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    ctx.route(re.compile(r"fonts\.(googleapis|gstatic)\.com"), lambda r: r.abort())
    ctx.add_init_script(NO_VT)
    page = ctx.new_page()
    a = App(page)
    yield a
    a.check()
    ctx.close()


@pytest.fixture
def phone(browser):
    # 360 px — самая узкая из распространённых ширин; всё, что помещается здесь, помещается и на 390
    ctx = browser.new_context(viewport={"width": 360, "height": 780}, is_mobile=True, has_touch=True)
    ctx.route(re.compile(r"fonts\.(googleapis|gstatic)\.com"), lambda r: r.abort())
    ctx.add_init_script(NO_VT)
    page = ctx.new_page()
    a = App(page)
    yield a
    a.check()
    ctx.close()
