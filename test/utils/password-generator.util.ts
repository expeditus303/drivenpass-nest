import { generate, GenerateOptions } from 'generate-password';

export function passwordGenerator(options?: Partial<GenerateOptions>): string {
  const defaultOptions: GenerateOptions = {
    length: 10,
    numbers: true,
    symbols: true,
    uppercase: true,
    lowercase: true,
    strict: true,
  };

  const finalOptions = { ...defaultOptions, ...options };

  return generate(finalOptions);
}
