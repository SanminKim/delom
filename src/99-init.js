if(!location.hash)history.replaceState(null,'',S.authed?'#dashboard':'#welcome');
render(true);
