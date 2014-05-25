function LoginState() {

}

LoginState.prototype = new StatePrototype();

LoginState.prototype.subLoad = function() {
    this.fragment = document.createDocumentFragment();
    this.holder = document.createElement("div");
    this.holder.id = "login";

    var a = document.createElement("a");
    this.holder.appendChild(a);
    a.setAttribute("href", "#");
    a.appendChild(document.createTextNode("Login"));
    this.fragment.appendChild(this.holder);

    a.addEventListener("click", this.onLoginClicked);

    this.machine.onStateLoaded(this);
};

LoginState.prototype.onLoginClicked = function(e) {
    window.app.network.postMessage({login:1});
    
    e.preventDefault();
};

LoginState.prototype.show = function() {
    window.ui.appendChild(this.fragment);

    this.machine.collapse();
};

LoginState.prototype.subDestroy = function() {
    window.ui.removeChild(this.holder);
};

LoginState.prototype.handleMessage = function(message) {
    switch(message.id)
    {
        case Orionark.Messages.LoginRequired.id:
        {
            var out = Orionark.Messages.ClientLogin.create();
            window.app.network.postMessage({message:out});
        }
        break;

        case Orionark.Messages.LoginTicket.id:
        {
            window.app.network.postMessage({transfer:1});
        }
        break;

        default:
            return false;
    }

    return true;
};

LoginState.prototype.handleConnect = function(type) {
    if( type === "authentication" )
    {
        //Do nothing, wait for LoginRequired message
    }
    else if( type === "gateway" )
    {
        this.machine.push(new GameState());
    }
    else
    {
        return false;
    }

    return true;
};