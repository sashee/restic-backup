termux_step_make_install() {
	mkdir -p "$TERMUX_PREFIX/lib/$TERMUX_PKG_NAME"
	cp -R /home/builder/termux-packages/packages/$TERMUX_PKG_NAME/usr/lib/$TERMUX_PKG_NAME/* "$TERMUX_PREFIX/lib/$TERMUX_PKG_NAME"
	mkdir -p "$TERMUX_PREFIX/bin"
	ln -s ../lib/$TERMUX_PKG_NAME/index.js $TERMUX_PREFIX/bin/$TERMUX_PKG_NAME
}
