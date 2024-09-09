termux_step_make_install() {
	echo "installing!"
	echo "=====3"
	echo "=====4"
	echo "=====5"
	echo "$TERMUX_PKG_NAME"
	ls .
	pwd
	ls -R /home/builder/termux-packages/packages/$TERMUX_PKG_NAME
	mkdir -p "$TERMUX_PREFIX/lib/$TERMUX_PKG_NAME"
	cp -R /home/builder/termux-packages/packages/$TERMUX_PKG_NAME/usr/lib/$TERMUX_PKG_NAME/* "$TERMUX_PREFIX/lib/$TERMUX_PKG_NAME"
	mkdir -p "$TERMUX_PREFIX/bin"
	ln -s ../lib/$TERMUX_PKG_NAME/index.js $TERMUX_PREFIX/bin/$TERMUX_PKG_NAME
	echo "lib"
	ln "$TERMUX_PREFIX/lib/$TERMUS_PKG_NAME"
	echo "bin"
	ln "$TERMUX_PREFIX/bin"
	echo $TERMUX_DEBDIR
}
