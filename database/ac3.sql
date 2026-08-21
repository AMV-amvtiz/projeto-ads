ALTER TABLE agendamento
ALTER COLUMN status TYPE VARCHAR(30);

ALTER TABLE agendamento
ADD COLUMN observacoes_retorno TEXT;

ALTER TABLE agendamento
ADD COLUMN data_retorno DATE;
