function LoginState() {

}

LoginState.prototype = new StatePrototype();

LoginState.prototype.subLoad = function() {
    this.fragment = document.createDocumentFragment();
    this.holder = document.createElement("div");
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
    return false;
};

LoginState.prototype.show = function() {
    document.body.appendChild(this.fragment);

    this.machine.collapse();
};

LoginState.prototype.subDestroy = function() {
    document.body.removeChild(this.holder);
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
            if( this.under )
            {
                this.under.handleMessage(message);
            }
            else
            {
                console.log("LoginState::handleMessage() Unhandled message...");
                console.log(message);
            }
    }
}

LoginState.prototype.handleConnect = function(type) {
    if( type === "authentication" )
    {
        //Do nothing, wait for LoginRequired message
    }
    else if( type === "gateway" )
    {
        this.machine.push(new GameState());
    }
    else if( this.under )
    {
        this.under.handleConnect(type);
    }
    else
    {
        console.log("LoginState::handleConnect() Unhandled connection '" + type + "'");
    }
}