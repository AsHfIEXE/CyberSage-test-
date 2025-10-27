"""
Advanced Fuzzing Engine
Comprehensive fuzzing with permutations, custom payloads, and intelligent mutation
"""

import random
import string
import itertools
import struct
from urllib.parse import quote

class AdvancedFuzzer:
    """
    Advanced fuzzing engine with multiple strategies
    """
    
    def __init__(self):
        self.mutation_strategies = [
            self.bit_flip,
            self.byte_flip,
            self.arithmetic,
            self.interesting_values,
            self.dictionary_insert,
            self.havoc
        ]
        
        self.dictionaries = self._load_dictionaries()
    
    def _load_dictionaries(self):
        """Load fuzzing dictionaries"""
        return {
            'sql': [
                "'", '"', "' OR '1'='1", "admin'--", "1=1", "OR 1=1",
                "UNION SELECT", "DROP TABLE", "; DELETE FROM", "' AND '1'='2",
                "/*!50000", "CONCAT(", "GROUP BY", "HAVING", "ORDER BY"
            ],
            'xss': [
                "<script>", "</script>", "alert(", "javascript:", "onerror=",
                "onload=", "<img", "<svg", "<iframe", "document.cookie",
                "eval(", "String.fromCharCode", "<body", "onclick="
            ],
            'command': [
                ";", "|", "&", "&&", "||", "`", "$(", ")", 
                "ls", "cat", "whoami", "id", "sleep", "ping",
                "/etc/passwd", "C:\\Windows\\", "../", "..\\"
            ],
            'format': [
                "%s", "%d", "%x", "%n", "%p", "{{", "}}", "${",
                "#{", "<%= ", "%>", "[[", "]]", "{$", "$}"
            ],
            'special': [
                "\x00", "\r\n", "\n", "\r", "\t", "\x0b", "\x0c",
                "\x1b", "\x7f", "\xff", "\x01", "\x02", "\x03"
            ],
            'unicode': [
                "\u0000", "\uffff", "\u0001", "\u00ff", "\u0100",
                "\ud800", "\udfff", "\ufeff", "\ufffd", "\u202e"
            ],
            'numbers': [
                "0", "-1", "1", "255", "256", "65535", "65536",
                "2147483647", "-2147483648", "4294967295", "4294967296",
                "NaN", "Infinity", "-Infinity", "1e308", "-1e308"
            ],
            'paths': [
                ".", "..", "/", "\\", "//", "\\\\", "../../../",
                "..\\..\\..\\", "C:", "D:", "/etc/", "/var/", "/tmp/"
            ]
        }
    
    def generate_fuzz_values(self, base_value, strategy='all'):
        """
        Generate fuzz values based on strategy
        """
        fuzz_values = []
        
        if strategy == 'all' or strategy == 'mutation':
            fuzz_values.extend(self.mutation_fuzzing(base_value))
        
        if strategy == 'all' or strategy == 'generation':
            fuzz_values.extend(self.generation_fuzzing())
        
        if strategy == 'all' or strategy == 'dictionary':
            fuzz_values.extend(self.dictionary_fuzzing(base_value))
        
        if strategy == 'all' or strategy == 'permutation':
            fuzz_values.extend(self.permutation_fuzzing(base_value))
        
        if strategy == 'all' or strategy == 'boundary':
            fuzz_values.extend(self.boundary_fuzzing())
        
        # Remove duplicates while preserving order
        seen = set()
        unique_values = []
        for value in fuzz_values:
            value_str = str(value)
            if value_str not in seen:
                seen.add(value_str)
                unique_values.append(value)
        
        return unique_values[:1000]  # Limit to 1000 values
    
    def mutation_fuzzing(self, base_value):
        """
        Mutate the base value using various strategies
        """
        mutations = []
        base_str = str(base_value)
        
        # Apply each mutation strategy
        for strategy in self.mutation_strategies:
            mutated = strategy(base_str)
            if mutated and mutated != base_str:
                mutations.append(mutated)
        
        # Character mutations
        for i in range(min(len(base_str), 10)):
            # Delete character
            if len(base_str) > 1:
                mutations.append(base_str[:i] + base_str[i+1:])
            
            # Duplicate character
            mutations.append(base_str[:i] + base_str[i] + base_str[i:])
            
            # Replace with special character
            for char in ['<', '>', '"', "'", '&', ';', '|', '\x00', '\n']:
                mutations.append(base_str[:i] + char + base_str[i+1:])
        
        # Length mutations
        mutations.append(base_str * 2)  # Double
        mutations.append(base_str * 10)  # Repeat 10 times
        mutations.append(base_str * 100)  # Repeat 100 times
        mutations.append(base_str[:len(base_str)//2])  # Half
        mutations.append('')  # Empty
        
        # Case mutations
        mutations.append(base_str.upper())
        mutations.append(base_str.lower())
        mutations.append(base_str.swapcase())
        
        # Encoding mutations
        mutations.append(quote(base_str))
        mutations.append(quote(quote(base_str)))  # Double encode
        mutations.append(base_str.replace(' ', '+'))
        mutations.append(base_str.replace(' ', '%20'))
        
        return mutations
    
    def generation_fuzzing(self):
        """
        Generate fuzz values from scratch
        """
        generated = []
        
        # Random strings
        for length in [1, 10, 100, 1000, 10000]:
            generated.append('A' * length)
            generated.append(''.join(random.choices(string.printable, k=length)))
            generated.append(''.join(random.choices(string.ascii_letters + string.digits, k=length)))
        
        # Format strings
        generated.extend(['%s', '%d', '%x', '%n', '%p'] * 5)
        generated.append('%s' * 100)
        generated.append('%n' * 10)
        
        # Buffer overflow attempts
        for size in [100, 255, 256, 1023, 1024, 4095, 4096, 65535, 65536]:
            generated.append('A' * size)
            generated.append('\x41' * size)
            generated.append('\x00' * size)
        
        # Special patterns
        generated.append('A' * 100 + 'B' * 100)  # Pattern for overflow detection
        generated.append('\x41\x41\x41\x41')  # AAAA
        generated.append('\xde\xad\xbe\xef')  # DEADBEEF
        
        # Null bytes and terminators
        generated.extend(['\x00', '%00', '\0', 'test\x00test'])
        
        # Unicode edge cases
        generated.extend([
            '\U0001F4A9',  # Emoji
            '\u202e',  # Right-to-left override
            '\ufeff',  # Zero-width no-break space
            '\u0000',  # Null
            '\uffff'   # Max BMP
        ])
        
        return generated
    
    def dictionary_fuzzing(self, base_value):
        """
        Use dictionaries to generate fuzz values
        """
        fuzzed = []
        base_str = str(base_value)
        
        # Replace base value with dictionary entries
        for category, entries in self.dictionaries.items():
            for entry in entries[:10]:  # Limit entries per category
                fuzzed.append(entry)
                fuzzed.append(base_str + entry)
                fuzzed.append(entry + base_str)
                
                # Insert in middle
                if len(base_str) > 2:
                    mid = len(base_str) // 2
                    fuzzed.append(base_str[:mid] + entry + base_str[mid:])
        
        # Combine multiple dictionary entries
        for _ in range(20):
            combo = ''
            for _ in range(random.randint(2, 5)):
                category = random.choice(list(self.dictionaries.keys()))
                entry = random.choice(self.dictionaries[category])
                combo += entry
            fuzzed.append(combo)
        
        return fuzzed
    
    def permutation_fuzzing(self, base_value):
        """
        Generate permutations of the base value
        """
        permutations = []
        base_str = str(base_value)
        
        # Character permutations (only for short strings)
        if len(base_str) <= 6:
            for perm in itertools.permutations(base_str):
                permutations.append(''.join(perm))
                if len(permutations) >= 100:
                    break
        
        # Word permutations
        words = base_str.split()
        if 2 <= len(words) <= 5:
            for perm in itertools.permutations(words):
                permutations.append(' '.join(perm))
        
        # Delimiter permutations
        delimiters = [' ', '-', '_', '.', '/', '\\', '|', ',', ';']
        for delim in delimiters:
            permutations.append(base_str.replace(' ', delim))
        
        # Reverse
        permutations.append(base_str[::-1])
        
        # Shuffle characters
        for _ in range(10):
            chars = list(base_str)
            random.shuffle(chars)
            permutations.append(''.join(chars))
        
        return permutations
    
    def boundary_fuzzing(self):
        """
        Generate boundary test values
        """
        boundaries = []
        
        # Integer boundaries
        boundaries.extend([
            0, -1, 1,
            127, 128, -128, -129,  # int8
            255, 256, -255, -256,  # uint8
            32767, 32768, -32768, -32769,  # int16
            65535, 65536, -65535, -65536,  # uint16
            2147483647, 2147483648, -2147483648, -2147483649,  # int32
            4294967295, 4294967296,  # uint32
            9223372036854775807, -9223372036854775808  # int64
        ])
        
        # Float boundaries
        boundaries.extend([
            0.0, -0.0,
            float('inf'), float('-inf'), float('nan'),
            1.7976931348623157e+308,  # Max float
            2.2250738585072014e-308,  # Min positive float
            1e308, -1e308
        ])
        
        # String length boundaries
        for i in range(20):
            length = 2 ** i
            boundaries.append('A' * length)
            boundaries.append('A' * (length - 1))
            boundaries.append('A' * (length + 1))
        
        # Time boundaries
        boundaries.extend([
            '1970-01-01', '2038-01-19',  # Unix timestamp limits
            '0000-00-00', '9999-12-31',
            '00:00:00', '23:59:59'
        ])
        
        return [str(b) for b in boundaries]
    
    # Mutation strategies
    def bit_flip(self, value):
        """Flip random bits"""
        if not value:
            return value
        
        try:
            bytes_val = value.encode()
            byte_array = bytearray(bytes_val)
            
            # Flip random bit
            if byte_array:
                byte_idx = random.randint(0, len(byte_array) - 1)
                bit_idx = random.randint(0, 7)
                byte_array[byte_idx] ^= (1 << bit_idx)
            
            return byte_array.decode('utf-8', errors='ignore')
        except:
            return value
    
    def byte_flip(self, value):
        """Flip random bytes"""
        if not value:
            return value
        
        try:
            bytes_val = value.encode()
            byte_array = bytearray(bytes_val)
            
            # Flip random byte
            if byte_array:
                byte_idx = random.randint(0, len(byte_array) - 1)
                byte_array[byte_idx] ^= 0xFF
            
            return byte_array.decode('utf-8', errors='ignore')
        except:
            return value
    
    def arithmetic(self, value):
        """Apply arithmetic operations"""
        try:
            # Try to parse as number
            if value.isdigit():
                num = int(value)
                operations = [
                    num + random.randint(1, 100),
                    num - random.randint(1, 100),
                    num * random.randint(2, 10),
                    num // 2 if num > 1 else 1,
                    -num
                ]
                return str(random.choice(operations))
        except:
            pass
        
        return value
    
    def interesting_values(self, value):
        """Replace with interesting values"""
        interesting = [
            '', '0', '1', '-1', 'null', 'undefined', 'NaN',
            'true', 'false', '[]', '{}', 'None', 'nil',
            '\x00', '\xff', ' ', '\t', '\n', '\r\n'
        ]
        
        # Sometimes replace entirely
        if random.random() < 0.3:
            return random.choice(interesting)
        
        # Sometimes append/prepend
        if random.random() < 0.5:
            return value + random.choice(interesting)
        else:
            return random.choice(interesting) + value
    
    def dictionary_insert(self, value):
        """Insert dictionary tokens"""
        if not value:
            return value
        
        # Pick random dictionary
        category = random.choice(list(self.dictionaries.keys()))
        token = random.choice(self.dictionaries[category])
        
        # Insert at random position
        if len(value) > 0:
            pos = random.randint(0, len(value))
            return value[:pos] + token + value[pos:]
        
        return token
    
    def havoc(self, value):
        """Apply multiple random mutations"""
        if not value:
            return value
        
        mutated = value
        
        # Apply 1-5 random mutations
        for _ in range(random.randint(1, 5)):
            mutation = random.choice([
                lambda x: x * 2,  # Duplicate
                lambda x: x[::-1],  # Reverse
                lambda x: x.upper(),  # Uppercase
                lambda x: x.lower(),  # Lowercase
                lambda x: x.replace(' ', ''),  # Remove spaces
                lambda x: ' '.join(x),  # Add spaces between chars
                lambda x: quote(x),  # URL encode
                lambda x: x + '\x00',  # Add null byte
                lambda x: '<' + x + '>',  # Wrap in brackets
                lambda x: x[1:] if len(x) > 1 else x,  # Remove first char
                lambda x: x[:-1] if len(x) > 1 else x,  # Remove last char
            ])
            
            try:
                mutated = mutation(mutated)
            except:
                pass
        
        return mutated
    
    def smart_fuzzing(self, value, context='unknown'):
        """
        Context-aware smart fuzzing
        """
        fuzzed = []
        
        # Detect context and apply appropriate fuzzing
        if context == 'email' or '@' in str(value):
            fuzzed.extend(self._fuzz_email(value))
        elif context == 'url' or 'http' in str(value):
            fuzzed.extend(self._fuzz_url(value))
        elif context == 'number' or str(value).isdigit():
            fuzzed.extend(self._fuzz_number(value))
        elif context == 'date' or '-' in str(value) and len(str(value)) == 10:
            fuzzed.extend(self._fuzz_date(value))
        elif context == 'json' or str(value).startswith('{'):
            fuzzed.extend(self._fuzz_json(value))
        else:
            # Generic fuzzing
            fuzzed.extend(self.generate_fuzz_values(value, 'all'))
        
        return fuzzed
    
    def _fuzz_email(self, email):
        """Fuzz email addresses"""
        fuzzed = []
        
        email_str = str(email)
        if '@' in email_str:
            user, domain = email_str.split('@', 1)
            
            # Fuzz user part
            fuzzed.append(f"{'A'*100}@{domain}")
            fuzzed.append(f"..@{domain}")
            fuzzed.append(f"{user}+test@{domain}")
            fuzzed.append(f"<{user}>@{domain}")
            
            # Fuzz domain part
            fuzzed.append(f"{user}@")
            fuzzed.append(f"{user}@.")
            fuzzed.append(f"{user}@localhost")
            fuzzed.append(f"{user}@127.0.0.1")
        
        # Invalid emails
        fuzzed.extend(['@', '@@', 'test@', '@test', 'test@@test'])
        
        return fuzzed
    
    def _fuzz_url(self, url):
        """Fuzz URLs"""
        fuzzed = []
        
        url_str = str(url)
        
        # Protocol fuzzing
        fuzzed.append(url_str.replace('http://', 'file://'))
        fuzzed.append(url_str.replace('http://', 'javascript:'))
        fuzzed.append(url_str.replace('http://', 'data:'))
        
        # Path fuzzing
        fuzzed.append(url_str + '/../../../etc/passwd')
        fuzzed.append(url_str + '/.git/config')
        fuzzed.append(url_str + '/.env')
        
        # Parameter fuzzing
        if '?' in url_str:
            fuzzed.append(url_str + '&debug=1')
            fuzzed.append(url_str + '&admin=true')
        
        return fuzzed
    
    def _fuzz_number(self, number):
        """Fuzz numeric values"""
        fuzzed = []
        
        try:
            num = float(str(number))
            
            # Boundary values
            fuzzed.extend([
                num - 1, num + 1,
                num * -1, num * 2,
                num / 2 if num != 0 else 0,
                0, -1, 1
            ])
            
            # Extreme values
            fuzzed.extend([
                float('inf'), float('-inf'), float('nan'),
                2**31 - 1, -2**31, 2**32 - 1
            ])
            
        except:
            pass
        
        return [str(f) for f in fuzzed]
    
    def _fuzz_date(self, date):
        """Fuzz date values"""
        fuzzed = []
        
        date_str = str(date)
        
        # Invalid dates
        fuzzed.extend([
            '0000-00-00', '9999-99-99',
            '2024-13-01', '2024-01-32',
            '2024-02-30', '2024-02-29'  # Non-leap year
        ])
        
        # Boundary dates
        fuzzed.extend([
            '1970-01-01', '2038-01-19',  # Unix timestamp limits
            '1900-01-01', '2100-12-31'
        ])
        
        # Format variations
        if '-' in date_str:
            fuzzed.append(date_str.replace('-', '/'))
            fuzzed.append(date_str.replace('-', '.'))
        
        return fuzzed
    
    def _fuzz_json(self, json_str):
        """Fuzz JSON values"""
        fuzzed = []
        
        # Malformed JSON
        fuzzed.extend([
            '{', '}', '[', ']',
            '{"test": }', '{"test": "value"',
            '{"test": undefined}', '{"test": NaN}',
            '{"__proto__": {"isAdmin": true}}'  # Prototype pollution
        ])
        
        # Large JSON
        fuzzed.append('{"a": ' * 1000 + '1' + '}' * 1000)
        
        return fuzzed
