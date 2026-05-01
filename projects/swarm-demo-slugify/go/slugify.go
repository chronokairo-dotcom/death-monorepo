package slugify

import (
	"strings"
	"unicode"
)

func Slugify(s string, separator string) string {
	var b strings.Builder
	prevSep := false
	for _, r := range s {
		if unicode.IsMark(r) {
			continue
		}
		r = unicode.ToLower(r)
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			b.WriteRune(r)
			prevSep = false
		} else {
			if b.Len() > 0 && !prevSep {
				b.WriteString(separator)
				prevSep = true
			}
		}
	}
	return strings.Trim(b.String(), separator)
}
