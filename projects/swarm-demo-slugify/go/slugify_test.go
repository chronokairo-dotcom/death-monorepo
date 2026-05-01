package slugify

import "testing"

func TestSlugify(t *testing.T) {
	tests := []struct {
		name      string
		input     string
		separator string
		expected  string
	}{
		{
			name:      "basic",
			input:     "Hello World",
			separator: "-",
			expected:  "hello-world",
		},
		{
			name:      "São Paulo",
			input:     "S\u0061\u0303o Paulo",
			separator: "-",
			expected:  "sao-paulo",
		},
		{
			name:      "custom separator",
			input:     "Hello World",
			separator: "_",
			expected:  "hello_world",
		},
		{
			name:      "empty string",
			input:     "",
			separator: "-",
			expected:  "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := Slugify(tt.input, tt.separator)
			if result != tt.expected {
				t.Errorf("Slugify(%q, %q) = %q, want %q", tt.input, tt.separator, result, tt.expected)
			}
		})
	}
}
